import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    LinearProgress,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {
    Add,
    Block,
    Check,
    CloudDownload,
    Delete,
    Deselect,
    Edit,
    NewReleases,
    SelectAll,
    Sync
} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {AdminPriceDto} from "../dto/admin-price-dto";
import AdminAPI from "../service/AdminAPI";

export default function PageAdmin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<string>("");
    const [prices, setPrices] = useState<AdminPriceDto[]>([]);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [editingPrice, setEditingPrice] = useState<AdminPriceDto | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        acPrice: "",
        dcPrice: ""
    });

    // Import states
    const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
    const [importSource, setImportSource] = useState<string>("");
    const [importData, setImportData] = useState<any>(null);
    const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [importError, setImportError] = useState<string>("");
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [filterAction, setFilterAction] = useState<string>('all'); // all, new, update, unchanged

    useEffect(() => {
        // Don't auto-login with stored credentials for security
        // Remove stored credentials if they exist
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_password");
    }, []);

    const verifyAndFetchPrices = (user: string, pass: string): Promise<void> => {
        return AdminAPI.authCheck(user, pass)
            .then(() => AdminAPI.getPrices(user, pass))
            .then((pricesData) => {
                setPrices(pricesData);
                setIsAuthenticated(true);
            })
            .catch((error) => {
                setIsAuthenticated(false);
                throw error;
            });
    };

    const handleLogin = () => {
        if (!username.trim() || !password.trim()) {
            setLoginError("Kullanıcı adı ve şifre gerekli");
            return;
        }

        setIsLoading(true);
        setLoginError("");

        verifyAndFetchPrices(username.trim(), password.trim())
            .catch((error: any) => {
                setLoginError("Giriş başarısız. Bilgilerinizi kontrol edin.");
                console.error("Login error:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUsername("");
        setPassword("");
    };

    const handleEdit = (price: AdminPriceDto) => {
        setEditingPrice(price);
        setFormData({
            name: price.name,
            acPrice: price.ac_price?.toString() || "",
            dcPrice: price.dc_price?.toString() || ""
        });
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingPrice(null);
        setFormData({
            name: "",
            acPrice: "",
            dcPrice: ""
        });
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Bu fiyatı silmek istediğinizden emin misiniz?")) {
            AdminAPI.deletePrice(username, password, id)
                .then(() => verifyAndFetchPrices(username, password))
                .catch((error) => {
                    alert("Fiyat silinirken hata oluştu");
                });
        }
    };

    const handleSave = () => {
        const acPrice = formData.acPrice ? parseFloat(formData.acPrice) : undefined;
        const dcPrice = formData.dcPrice ? parseFloat(formData.dcPrice) : undefined;

        const updatePromise = editingPrice
            ? AdminAPI.updatePrice(username, password, editingPrice.id, formData.name, acPrice, dcPrice)
            : AdminAPI.createPrice(username, password, formData.name, acPrice, dcPrice);

        updatePromise
            .then(() => {
                setDialogOpen(false);
                verifyAndFetchPrices(username, password);
            })
            .catch((error) => {
                alert("Fiyat kaydedilirken hata oluştu");
            });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImportOpen = () => {
        setImportDialogOpen(true);
        setImportSource("");
        setImportData(null);
        setImportError("");
        setOverwriteExisting(false);
    };

    const handleImportClose = () => {
        setImportDialogOpen(false);
        setImportData(null);
        setImportError("");
    };

    const handleImportPreview = () => {
        if (!importSource.trim()) {
            setImportError("URL belirtilmelidir");
            return;
        }

        setIsImporting(true);
        setImportError("");

        AdminAPI.importData(username, password, importSource.trim())
            .then((data) => {
                setImportData(data);
                setImportError("");
                resetImportSelection(); // Reset selections when new data is loaded
            })
            .catch((error: any) => {
                setImportError("İçe aktarma başarısız: " + (error.message || "Bilinmeyen hata"));
            })
            .finally(() => {
                setIsImporting(false);
            });
    };

    const handleImportConfirm = () => {
        if (!importData || !importData.importData) {
            return;
        }

        setIsImporting(true);

        AdminAPI.confirmImport(username, password, importData.importData, overwriteExisting, Array.from(selectedItems))
            .then((response) => {
                alert(`${response.message}\n\nÖzet:\nToplam: ${response.summary.total}\nSeçili: ${response.summary.selected}\nOluşturulan: ${response.summary.created}\nGüncellenen: ${response.summary.updated}\nAtlanan: ${response.summary.skipped}`);
                handleImportClose();
                verifyAndFetchPrices(username, password);
            })
            .catch((error: any) => {
                setImportError("İçe aktarma onayı başarısız: " + (error.message || "Bilinmeyen hata"));
            })
            .finally(() => {
                setIsImporting(false);
            });
    };

    const handleItemToggle = (index: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedItems(newSelected);
        setSelectAll(newSelected.size === filteredPreview?.length);
    };

    const handleSelectAllToggle = () => {
        if (!importData?.preview) return;

        if (selectAll) {
            setSelectedItems(new Set());
            setSelectAll(false);
        } else {
            // Select only items that match current filter
            const filteredIndices = filteredPreview.map((item: any, index: number) => {
                return importData.preview.indexOf(item);
            });
            setSelectedItems(new Set(filteredIndices));
            setSelectAll(true);
        }
    };

    const resetImportSelection = () => {
        setSelectedItems(new Set());
        setSelectAll(false);
        setFilterAction('all');
    };

    const getFilteredPreview = () => {
        if (!importData?.preview) return [];

        if (filterAction === 'all') return importData.preview;
        return importData.preview.filter((item: any) => item.action === filterAction);
    };

    const filteredPreview = getFilteredPreview();

    if (!isAuthenticated) {
        return (
            <Container maxWidth="sm" sx={{mt: 8}}>
                <Paper sx={{p: 4}}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Admin Girişi
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                        Admin paneli için kullanıcı adı ve şifrenizi girin.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        error={!!loginError}
                        disabled={isLoading}
                    />
                    <TextField
                        fullWidth
                        label="Şifre"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        error={!!loginError}
                        helperText={loginError}
                        disabled={isLoading}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isLoading) {
                                handleLogin();
                            }
                        }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        sx={{mt: 2}}
                        disabled={isLoading}
                    >
                        {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{mt: 4}}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                <Typography variant="h4" component="h1">
                    Fiyat Yönetimi
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<CloudDownload/>}
                        onClick={handleImportOpen}
                        sx={{mr: 2}}
                    >
                        İçe Aktar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add/>}
                        onClick={handleAdd}
                        sx={{mr: 2}}
                    >
                        Yeni Fiyat Ekle
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleLogout}
                    >
                        Çıkış Yap
                    </Button>
                </Box>
            </Box>

            {prices.length === 0 ? (
                <Paper sx={{p: 4, textAlign: 'center'}}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz fiyat kaydı bulunmuyor.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add/>}
                        onClick={handleAdd}
                        sx={{mt: 2}}
                    >
                        İlk Fiyatı Ekle
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Firma Adı</TableCell>
                                <TableCell align="right">AC Fiyat</TableCell>
                                <TableCell align="right">DC Fiyat</TableCell>
                                <TableCell align="center">Güncelleme Tarihi</TableCell>
                                <TableCell align="center">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {prices.map((price) => (
                                <TableRow key={price.id}>
                                    <TableCell>{price.name}</TableCell>
                                    <TableCell align="right">
                                        {price.ac_price !== null && price.ac_price !== undefined
                                            ? `₺${price.ac_price.toFixed(2)}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell align="right">
                                        {price.dc_price !== null && price.dc_price !== undefined
                                            ? `₺${price.dc_price.toFixed(2)}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {new Date(price.updated_at).toLocaleString("tr-TR")}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEdit(price)}
                                        >
                                            <Edit/>
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(price.id)}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingPrice ? "Fiyat Düzenle" : "Yeni Fiyat Ekle"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Firma Adı"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="AC Fiyat"
                        type="number"
                        value={formData.acPrice}
                        onChange={(e) => handleInputChange("acPrice", e.target.value)}
                        margin="normal"
                        inputProps={{step: "0.01", min: "0"}}
                    />
                    <TextField
                        fullWidth
                        label="DC Fiyat"
                        type="number"
                        value={formData.dcPrice}
                        onChange={(e) => handleInputChange("dcPrice", e.target.value)}
                        margin="normal"
                        inputProps={{step: "0.01", min: "0"}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleSave} variant="contained">
                        {editingPrice ? "Güncelle" : "Ekle"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importDialogOpen} onClose={handleImportClose} maxWidth="md" fullWidth>
                <DialogTitle>Veri İçe Aktar</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="İçe Aktarma URL'i"
                        placeholder="https://example.com/api/ev-chargers"
                        value={importSource}
                        onChange={(e) => setImportSource(e.target.value)}
                        margin="normal"
                        disabled={isImporting}
                        helperText="• https:// ile başlayan tam URL"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        multiline
                        rows={1}
                    />

                    {isImporting && <LinearProgress sx={{mt: 2, mb: 2}}/>}

                    {importError && (
                        <Alert severity="error" sx={{mt: 2, mb: 2}}>
                            {importError}
                        </Alert>
                    )}

                    {!importData && (
                        <Box sx={{mt: 2}}>
                            <Button
                                variant="contained"
                                onClick={handleImportPreview}
                                disabled={isImporting || !importSource.trim()}
                                startIcon={<CloudDownload/>}
                            >
                                {isImporting ? "Veri Getiriliyor..." : "Veriyi Önizle"}
                            </Button>
                        </Box>
                    )}

                    {importData && (
                        <Box sx={{mt: 3}}>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                                <Typography variant="h6">
                                    İçe Aktarma Önizlemesi
                                </Typography>
                                <Box>
                                    <Button
                                        size="small"
                                        onClick={handleSelectAllToggle}
                                        startIcon={selectAll ? <Deselect/> : <SelectAll/>}
                                        sx={{mr: 1}}
                                    >
                                        {selectAll ? "Tümünü Kaldır" : "Tümünü Seç"}
                                    </Button>
                                    <Chip
                                        label={`${selectedItems.size}/${importData.totalItems} seçili`}
                                        color={selectedItems.size > 0 ? "primary" : "default"}
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>

                            {/* Statistics */}
                            {importData.stats && (
                                <Box sx={{mb: 2}}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Değişiklik Özeti:
                                    </Typography>
                                    <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                        <Chip
                                            label={`${importData.stats.new} Yeni`}
                                            color="success"
                                            icon={<NewReleases/>}
                                            size="small"
                                        />
                                        <Chip
                                            label={`${importData.stats.update} Güncellenecek`}
                                            color="warning"
                                            icon={<Sync/>}
                                            size="small"
                                        />
                                        <Chip
                                            label={`${importData.stats.unchanged} Değişiklik Yok`}
                                            color="default"
                                            icon={<Block/>}
                                            size="small"
                                        />
                                        <Chip
                                            label={`Toplam: ${importData.stats.total}`}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            )}

                            {/* Filter Controls */}
                            <Box sx={{mb: 2, display: 'flex', gap: 1, alignItems: 'center'}}>
                                <Typography variant="body2" sx={{mr: 1}}>Filtrele:</Typography>
                                <Button
                                    size="small"
                                    variant={filterAction === 'all' ? 'contained' : 'outlined'}
                                    onClick={() => setFilterAction('all')}
                                    color="primary"
                                >
                                    Tümü ({importData.totalItems})
                                </Button>
                                <Button
                                    size="small"
                                    variant={filterAction === 'new' ? 'contained' : 'outlined'}
                                    onClick={() => setFilterAction('new')}
                                    color="success"
                                >
                                    Yeni ({importData.stats?.new || 0})
                                </Button>
                                <Button
                                    size="small"
                                    variant={filterAction === 'update' ? 'contained' : 'outlined'}
                                    onClick={() => setFilterAction('update')}
                                    color="warning"
                                >
                                    Güncellenecek ({importData.stats?.update || 0})
                                </Button>
                                <Button
                                    size="small"
                                    variant={filterAction === 'unchanged' ? 'contained' : 'outlined'}
                                    onClick={() => setFilterAction('unchanged')}
                                    color="inherit"
                                >
                                    Aynı ({importData.stats?.unchanged || 0})
                                </Button>
                            </Box>

                            <Alert severity="info" sx={{mb: 2}}>
                                {filterAction === 'all'
                                    ? `Toplam ${importData.totalItems} kayıt gösteriliyor.`
                                    : `${filterAction === 'new' ? 'Yeni' : filterAction === 'update' ? 'Güncellenecek' : 'Aynı'} kayıtlar gösteriliyor (${filteredPreview.length} adet).`
                                }
                                İşlem yapmak için kayıtları seçin.
                            </Alert>

                            <TableContainer component={Paper} variant="outlined" sx={{mb: 2, maxHeight: 400}}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox" sx={{width: 50}}>
                                                <Checkbox
                                                    indeterminate={selectedItems.size > 0 && selectedItems.size < filteredPreview.length}
                                                    checked={selectAll}
                                                    onChange={handleSelectAllToggle}
                                                />
                                            </TableCell>
                                            <TableCell>Firma Adı</TableCell>
                                            <TableCell align="center">Mevcut AC</TableCell>
                                            <TableCell align="center">Yeni AC</TableCell>
                                            <TableCell align="center">Mevcut DC</TableCell>
                                            <TableCell align="center">Yeni DC</TableCell>
                                            <TableCell align="center">Durum</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredPreview.map((item: any, index: number) => {
                                            const originalIndex = importData.preview.indexOf(item);
                                            const isSelected = selectedItems.has(originalIndex);
                                            return (
                                                <TableRow
                                                    key={index}
                                                    selected={isSelected}
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        },
                                                        '&.Mui-selected': {
                                                            backgroundColor: 'action.selected'
                                                        }
                                                    }}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onChange={() => handleItemToggle(originalIndex)}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{fontWeight: isSelected ? 'bold' : 'normal'}}>
                                                        {item.name}
                                                    </TableCell>
                                                    <TableCell align="center"
                                                               sx={{color: item.changes.some(c => c.field === 'ac_price') ? 'warning.main' : 'text.secondary'}}>
                                                        {item.existing_ac !== null ? `₺${item.existing_ac.toFixed(2)}` : "-"}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{
                                                        color: item.changes.some(c => c.field === 'ac_price') ? 'warning.main' : 'text.primary',
                                                        fontWeight: item.changes.some(c => c.field === 'ac_price') ? 'bold' : 'normal'
                                                    }}>
                                                        {item.ac_price ? `₺${item.ac_price.toFixed(2)}` : "-"}
                                                    </TableCell>
                                                    <TableCell align="center"
                                                               sx={{color: item.changes.some(c => c.field === 'dc_price') ? 'warning.main' : 'text.secondary'}}>
                                                        {item.existing_dc !== null ? `₺${item.existing_dc.toFixed(2)}` : "-"}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{
                                                        color: item.changes.some(c => c.field === 'dc_price') ? 'warning.main' : 'text.primary',
                                                        fontWeight: item.changes.some(c => c.field === 'dc_price') ? 'bold' : 'normal'
                                                    }}>
                                                        {item.dc_price ? `₺${item.dc_price.toFixed(2)}` : "-"}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {item.action === 'new' && (
                                                            <Chip
                                                                label="Yeni"
                                                                color="success"
                                                                size="small"
                                                                icon={<NewReleases/>}
                                                            />
                                                        )}
                                                        {item.action === 'update' && (
                                                            <Chip
                                                                label="Güncellenecek"
                                                                color="warning"
                                                                size="small"
                                                                icon={<Sync/>}
                                                            />
                                                        )}
                                                        {item.action === 'unchanged' && (
                                                            <Chip
                                                                label="Aynı"
                                                                color="default"
                                                                size="small"
                                                                icon={<Block/>}
                                                            />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={overwriteExisting}
                                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                                        color="warning"
                                    />
                                }
                                label="Mevcut kayıtların üzerine yaz"
                                sx={{mb: 2}}
                            />

                            <Typography variant="body2" color="text.secondary">
                                Seçili {selectedItems.size} kayıt
                                veritabanına {overwriteExisting ? "eklenecek veya güncellenecek" : "eklenecek"}.
                                Mevcut kayıtların üzerine yaz seçeneğini işaretlediyseniz, aynı isme sahip kayıtlar
                                güncellenecektir.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleImportClose} disabled={isImporting}>
                        İptal
                    </Button>
                    {importData && (
                        <Button
                            onClick={handleImportConfirm}
                            variant="contained"
                            color="warning"
                            disabled={isImporting || selectedItems.size === 0}
                            startIcon={<Check/>}
                        >
                            {isImporting
                                ? "İçe Aktarılıyor..."
                                : `${selectedItems.size} Kaydı İçe Aktar`
                            }
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}