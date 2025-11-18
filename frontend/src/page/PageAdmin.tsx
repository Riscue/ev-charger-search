import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    LinearProgress,
    Paper,
    Typography,
    Fab,
    AppBar,
    Toolbar
} from "@mui/material";
import {
    Add,
    Logout,
    CloudDownload,
    Sync
} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {AdminPriceDto} from "../dto/admin-price-dto";
import AdminAPI from "../service/AdminAPI";
import AdminAuth from "../components/admin/AdminAuth";
import PriceTable from "../components/admin/PriceTable";
import PriceForm from "../components/admin/PriceForm";
import ImportDialog from "../components/admin/ImportDialog";

export default function PageAdmin() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState<{ username: string; password: string } | null>(null);
    const [prices, setPrices] = useState<AdminPriceDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Form states
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [editingPrice, setEditingPrice] = useState<AdminPriceDto | null>(null);
    const [formError, setFormError] = useState<string>("");

    // Import states
    const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);

    const handleAuthSuccess = (username: string, password: string) => {
        setAuth({ username, password });
        refreshPrices(username, password);
    };

    const handleLogout = () => {
        setAuth(null);
        setPrices([]);
        setError("");
        navigate("/");
    };

    const refreshPrices = (username: string, password: string) => {
        setIsLoading(true);
        AdminAPI.getPrices(username, password)
            .then((pricesData) => {
                setPrices(pricesData);
                setError("");
            })
            .catch((error: any) => {
                setError("Fiyatlar yüklenirken hata oluştu");
                console.error("Price fetch error:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleCreatePrice = () => {
        setEditingPrice(null);
        setFormError("");
        setDialogOpen(true);
    };

    const handleEditPrice = (price: AdminPriceDto) => {
        setEditingPrice(price);
        setFormError("");
        setDialogOpen(true);
    };

    const handleDeletePrice = (price: AdminPriceDto) => {
        if (!auth) return;

        if (!window.confirm(`${price.name} fiyatını silmek istediğinizden emin misiniz?`)) {
            return;
        }

        setIsLoading(true);
        AdminAPI.deletePrice(auth.username, auth.password, price.id)
            .then(() => {
                refreshPrices(auth.username, auth.password);
            })
            .catch((error: any) => {
                setError("Fiyat silinirken hata oluştu");
                console.error("Price delete error:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSavePrice = (priceData: { name: string; acPrice?: number; dcPrice?: number }) => {
        if (!auth) return;

        setIsLoading(true);
        setFormError("");

        const promise = editingPrice
            ? AdminAPI.updatePrice(auth.username, auth.password, editingPrice.id, priceData.name, priceData.acPrice, priceData.dcPrice)
            : AdminAPI.createPrice(auth.username, auth.password, priceData.name, priceData.acPrice, priceData.dcPrice);

        promise
            .then(() => {
                setDialogOpen(false);
                refreshPrices(auth.username, auth.password);
            })
            .catch((error: any) => {
                setFormError(error.message || (editingPrice ? "Fiyat güncellenirken hata oluştu" : "Fiyat eklenirken hata oluştu"));
                console.error("Price save error:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleImport = async (source: string) => {
        if (!auth) throw new Error("Authentication required");
        return await AdminAPI.importData(auth.username, auth.password, source);
    };

    const handleConfirmImport = async (importData: any[], overwrite: boolean, selectedItems: number[]) => {
        if (!auth) throw new Error("Authentication required");
        await AdminAPI.confirmImport(auth.username, auth.password, importData, overwrite, selectedItems);
        refreshPrices(auth.username, auth.password);
    };

    if (!auth) {
        return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Admin Panel - Fiyat Yönetimi
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<CloudDownload />}
                        onClick={() => setImportDialogOpen(true)}
                        disabled={isLoading}
                    >
                        İçe Aktar
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<Sync />}
                        onClick={() => refreshPrices(auth.username, auth.password)}
                        disabled={isLoading}
                    >
                        Yenile
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                    >
                        Çıkış
                    </Button>
                </Toolbar>
            </AppBar>

            <Container component="main" maxWidth="lg" sx={{mt: 4, mb: 4, flexGrow: 1}}>
                {isLoading && <LinearProgress sx={{mb: 2}} />}

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{p: 2, mb: 3}}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Fiyat Yönetimi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Toplam {prices.length} fiyat kaydı bulunuyor.
                    </Typography>
                </Paper>

                <PriceTable
                    prices={prices}
                    onEdit={handleEditPrice}
                    onDelete={handleDeletePrice}
                />

                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16
                    }}
                    onClick={handleCreatePrice}
                    disabled={isLoading}
                >
                    <Add />
                </Fab>

                <PriceForm
                    open={dialogOpen}
                    editingPrice={editingPrice}
                    onClose={() => setDialogOpen(false)}
                    onSubmit={handleSavePrice}
                    isLoading={isLoading}
                    error={formError}
                />

                <ImportDialog
                    open={importDialogOpen}
                    onClose={() => setImportDialogOpen(false)}
                    onImport={handleImport}
                    onConfirm={handleConfirmImport}
                    isLoading={isImporting}
                />
            </Container>
        </Box>
    );
}