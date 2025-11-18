import React, {useState} from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Box,
    Alert,
    LinearProgress,
    Typography,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControlLabel,
    Switch,
    IconButton
} from "@mui/material";
import {
    CloudDownload,
    Check,
    NewReleases,
    SelectAll,
    Deselect
} from "@mui/icons-material";

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImport: (source: string) => Promise<any>;
    onConfirm: (importData: any[], overwrite: boolean, selectedItems: number[]) => Promise<void>;
    isLoading?: boolean;
    error?: string;
}

interface ImportItem {
    name: string;
    ac_price?: number;
    dc_price?: number;
    existing_ac?: number;
    existing_dc?: number;
    action: 'new' | 'update' | 'unchanged';
    changes: Array<{ field: string; old: number; new: number }>;
}

export default function ImportDialog({
    open,
    onClose,
    onImport,
    onConfirm,
    isLoading = false,
    error = ''
}: ImportDialogProps) {
    const [importSource, setImportSource] = useState<string>("");
    const [importData, setImportData] = useState<any>(null);
    const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [importError, setImportError] = useState<string>("");
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [filterAction, setFilterAction] = useState<string>('all');

    const handleImport = async () => {
        if (!importSource.trim()) {
            setImportError("İçe aktarma URL'si gereklidir");
            return;
        }

        setIsImporting(true);
        setImportError("");

        try {
            const result = await onImport(importSource.trim());
            setImportData(result);
            setSelectedItems(new Set());
        } catch (error: any) {
            setImportError(error.message || "İçe aktarma başarısız");
        } finally {
            setIsImporting(false);
        }
    };

    const handleConfirm = async () => {
        if (!importData?.importData) return;

        try {
            const itemsToProcess = selectedItems.size > 0
                ? Array.from(selectedItems)
                : importData.importData.map((_: any, index: number) => index);

            await onConfirm(importData.importData, overwriteExisting, itemsToProcess);
            handleClose();
        } catch (error: any) {
            setImportError(error.message || "İçe aktarma onayı başarısız");
        }
    };

    const handleClose = () => {
        setImportSource("");
        setImportData(null);
        setOverwriteExisting(false);
        setImportError("");
        setSelectedItems(new Set());
        setFilterAction('all');
        onClose();
    };

    const toggleItemSelection = (index: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedItems(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map((_: any, index: number) => getOriginalIndex(index))));
        }
    };

    const getOriginalIndex = (filteredIndex: number): number => {
        if (filterAction === 'all') return filteredIndex;

        let originalIndex = 0;
        let filteredCount = 0;

        for (const item of importData.importData) {
            if (filterAction === 'all' ||
                (filterAction === 'new' && item.action === 'new') ||
                (filterAction === 'update' && item.action === 'update') ||
                (filterAction === 'unchanged' && item.action === 'unchanged')) {
                if (filteredCount === filteredIndex) return originalIndex;
                filteredCount++;
            }
            originalIndex++;
        }
        return 0;
    };

    const getFilteredItems = (): ImportItem[] => {
        if (!importData?.preview) return [];

        return importData.preview.filter((item: ImportItem) => {
            if (filterAction === 'all') return true;
            return item.action === filterAction;
        });
    };

    const filteredItems = getFilteredItems();

    const formatPrice = (price?: number) => {
        return price !== undefined && price !== null ? `₺${price.toFixed(2)}` : '-';
    };

    const getActionChip = (action: string) => {
        const colors = {
            new: 'success',
            update: 'warning',
            unchanged: 'default'
        };
        const labels = {
            new: 'Yeni',
            update: 'Güncelle',
            unchanged: 'Değişiklik Yok'
        };
        return (
            <Chip
                label={labels[action as keyof typeof labels]}
                color={colors[action as keyof typeof colors] as any}
                size="small"
            />
        );
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>Veri İçe Aktar</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                {importError && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {importError}
                    </Alert>
                )}

                {!importData ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <TextField
                            label="İçe Aktarma URL'si"
                            placeholder="https://api.example.com/data"
                            value={importSource}
                            onChange={(e) => setImportSource(e.target.value)}
                            disabled={isImporting}
                            fullWidth
                        />

                        {isImporting && <LinearProgress />}

                        <Button
                            variant="contained"
                            startIcon={<CloudDownload />}
                            onClick={handleImport}
                            disabled={isImporting || !importSource.trim()}
                            sx={{alignSelf: 'flex-start'}}
                        >
                            {isImporting ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Typography variant="h6">
                            İçe Aktarma Özeti
                        </Typography>

                        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                            <Chip label={`Toplam: ${importData.stats.total}`} />
                            <Chip label={`Yeni: ${importData.stats.new}`} color="success" />
                            <Chip label={`Güncelle: ${importData.stats.update}`} color="warning" />
                            <Chip label={`Değişiklik Yok: ${importData.stats.unchanged}`} color="default" />
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={overwriteExisting}
                                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                                />
                            }
                            label="Mevcut verilerin üzerine yaz"
                        />

                        <TextField
                            label="Filtrele"
                            select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            SelectProps={{ native: true }}
                            sx={{width: 200}}
                        >
                            <option value="all">Tümü</option>
                            <option value="new">Yeni</option>
                            <option value="update">Güncelle</option>
                            <option value="unchanged">Değişiklik Yok</option>
                        </TextField>

                        <TableContainer component={Paper} sx={{maxHeight: 400}}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <IconButton onClick={toggleSelectAll} size="small">
                                                {selectedItems.size === filteredItems.length ? <Deselect /> : <SelectAll />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell>Firma Adı</TableCell>
                                        <TableCell align="right">AC Fiyat</TableCell>
                                        <TableCell align="right">DC Fiyat</TableCell>
                                        <TableCell align="right">Mevcut AC</TableCell>
                                        <TableCell align="right">Mevcut DC</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredItems.map((item, index) => {
                                        const originalIndex = getOriginalIndex(index);
                                        const isSelected = selectedItems.has(originalIndex);
                                        return (
                                            <TableRow
                                                key={originalIndex}
                                                selected={isSelected}
                                                hover
                                                onClick={() => toggleItemSelection(originalIndex)}
                                                sx={{cursor: 'pointer'}}
                                            >
                                                <TableCell padding="checkbox">
                                                    <IconButton size="small">
                                                        {isSelected ? <Check color="primary" /> : <div />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>{getActionChip(item.action)}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell align="right">{formatPrice(item.ac_price)}</TableCell>
                                                <TableCell align="right">{formatPrice(item.dc_price)}</TableCell>
                                                <TableCell align="right">{formatPrice(item.existing_ac)}</TableCell>
                                                <TableCell align="right">{formatPrice(item.existing_dc)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>
                    {importData ? 'İptal' : 'Kapat'}
                </Button>
                {importData && (
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        disabled={isLoading || isImporting}
                    >
                        {isLoading ? 'İçe Aktarılıyor...' : 'İçe Aktarımı Onayla'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}