import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Typography
} from "@mui/material";
import {Edit, Delete} from "@mui/icons-material";
import {AdminPriceDto} from "../../dto/admin-price-dto";

interface PriceTableProps {
    prices: AdminPriceDto[];
    onEdit: (price: AdminPriceDto) => void;
    onDelete: (price: AdminPriceDto) => void;
}

export default function PriceTable({prices, onEdit, onDelete}: PriceTableProps) {
    const formatPrice = (price?: number) => {
        return price !== undefined && price !== null ? `₺${price.toFixed(2)}` : '-';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR');
    };

    return (
        <TableContainer component={Paper} sx={{mt: 2}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Firma Adı</TableCell>
                        <TableCell align="right">AC Fiyat</TableCell>
                        <TableCell align="right">DC Fiyat</TableCell>
                        <TableCell>Güncelleme Tarihi</TableCell>
                        <TableCell align="center">İşlemler</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {prices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <Typography variant="body2" color="text.secondary">
                                    Henüz fiyat kaydı bulunmuyor
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        prices.map((price) => (
                            <TableRow key={price.id} hover>
                                <TableCell component="th" scope="row">
                                    <Typography variant="body1" fontWeight="medium">
                                        {price.name}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={formatPrice(price.ac_price)}
                                        color={price.ac_price ? 'primary' : 'default'}
                                        variant={price.ac_price ? 'filled' : 'outlined'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={formatPrice(price.dc_price)}
                                        color={price.dc_price ? 'secondary' : 'default'}
                                        variant={price.dc_price ? 'filled' : 'outlined'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDate(price.updated_at)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        onClick={() => onEdit(price)}
                                        size="small"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => onDelete(price)}
                                        size="small"
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}