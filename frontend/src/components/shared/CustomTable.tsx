import React, {CSSProperties, ReactElement, useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {LinearProgress} from "@mui/material";


function getValue(cell: Cell, row: any): any {
    return cell.getValue ? cell.getValue(row) : row[cell.field];
}

function getReactElement(cell: Cell, row: any): ReactElement {
    return cell.getReactElement ? cell.getReactElement(row) : getValue(cell, row);
}

function descendingComparator(sortOrder: SortOrder, a: any, b: any, cell: Cell): number {
    const aElement = getValue(cell, a);
    const bElement = getValue(cell, b);

    if ((aElement === undefined || aElement === null) && (bElement !== undefined && bElement !== null)) {
        return 1;
    } else if ((aElement !== undefined && aElement !== null) && (bElement === undefined || bElement === null)) {
        return -1;
    } else if (typeof aElement === 'number' && typeof bElement === 'number') {
        return sortOrder === "desc" ? bElement - aElement : aElement - bElement;
    } else if (typeof aElement === 'string' && typeof bElement === 'string') {
        return sortOrder === "desc" ? aElement.localeCompare(bElement) : bElement.localeCompare(aElement);
    } else if (aElement instanceof Date && bElement instanceof Date) {
        return sortOrder === "desc" ? bElement.getTime() - aElement.getTime() : aElement.getTime() - bElement.getTime();
    } else {
        return 0;
    }
}

function getComparator(sortOrder: SortOrder, cell: Cell): (a: any, b: any) => number {
    return (a, b) => descendingComparator(sortOrder, a, b, cell);
}

interface Cell {
    field: string;
    getValue?: (row: any) => any;
    getReactElement?: (row: any) => ReactElement;
    label?: string;
    sort?: boolean;
    showTotal?: boolean;
    style?: CSSProperties;
    align?: "left" | "center" | "right" | "justify" | "inherit";
    isRoot?: boolean;
}

interface EnhancedTableHeadProps {
    cells: Cell[];
    sortField: string | undefined;
    sortOrder: SortOrder;
    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
}

function EnhancedTableHead({
                               cells,
                               sortField,
                               sortOrder,
                               onRequestSort,
                           }: EnhancedTableHeadProps) {
    const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {cells && cells.map((cell) => (
                    cell.sort ?
                        <TableCell
                            key={cell.field}
                            align={cell.align}
                            sx={{padding: 0, pl: 2}}
                            style={cell.style}
                        >
                            <TableSortLabel
                                sx={{fontWeight: 'bold'}}
                                active={sortField === cell.field}
                                direction={sortField === cell.field ? sortOrder : 'asc'}
                                onClick={createSortHandler(cell.field)}
                            >
                                {cell.label}
                            </TableSortLabel>
                        </TableCell>
                        :
                        <TableCell
                            key={cell.field}
                            align={cell.align}
                            sx={{padding: 0, pl: 2}}
                            style={cell.style}
                        >
                            {cell.label}
                        </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function EnhancedTableToolbar({caption}: { caption: string }) {

    return (
        <Toolbar
            sx={[
                {
                    pl: {sm: 2},
                    pr: {xs: 1, sm: 1},
                    minHeight: {xs: 48},
                },
            ]}
        >
            <Typography
                sx={{flex: '1 1 100%'}}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                {caption}
            </Typography>
        </Toolbar>
    );
}

interface CustomTableProps {
    id?: string;
    cells: Cell[];
    sortField: string;
    sortOrder: SortOrder;
    handleRequestSort: (sortField: string, sortOrder: SortOrder) => void;
    rows: any[] | undefined;
    rowId: (row: any) => any;

    caption?: string;
    totalRow?: any;
    maxShow?: number;
    pagination?: boolean;
    spinner?: ReactElement;
}

function CustomTable({
                         id,
                         cells,
                         sortField,
                         sortOrder,
                         handleRequestSort,
                         rows,
                         rowId,
                         totalRow = undefined,
                         maxShow = undefined,
                         caption = undefined,
                         pagination = false,
                         spinner = <LinearProgress color="inherit"/>,
                     }: CustomTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const onRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
        const newOrder = sortField === property && sortOrder === 'asc' ? 'desc' : 'asc';
        handleRequestSort(property, newOrder);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value) || 10;
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (rows?.length || 0)) : 0;

    const visibleRows = useMemo(
        () => {
            let result = [...(rows || [])];

            const cell = cells.find(cell => cell.field === sortField);
            result = cell ?
                result.sort(getComparator(sortOrder, cell)) :
                result;

            result = pagination && rowsPerPage > 0 ?
                result.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) :
                maxShow ?
                    result.slice(0, maxShow) :
                    result;

            return result;
        },
        [sortOrder, sortField, page, rowsPerPage, rows],
    );

    return (
        <Box sx={{width: '100%'}}>
            <Paper sx={{width: '100%'}}>
                {caption && (
                    <EnhancedTableToolbar caption={caption}/>
                )}
                <TableContainer>
                    <Table
                        id={id}
                        aria-labelledby="tableTitle"
                        size="small"
                    >
                        <EnhancedTableHead
                            sortOrder={sortOrder}
                            sortField={sortField}
                            onRequestSort={onRequestSort}
                            cells={cells}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={rowId(row)}
                                    >
                                        {cells.map((cell) => (
                                            cell.isRoot ?
                                                getReactElement(cell, row) :
                                                <TableCell
                                                    key={rowId(row) + cell.field}
                                                    sx={{padding: 0, pl: 2}}
                                                    align={cell.align}
                                                >
                                                    {getReactElement(cell, row)}
                                                </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow style={{height: 30 * emptyRows, padding: 0}}>
                                    <TableCell colSpan={cells.length}/>
                                </TableRow>
                            )}
                            {!rows && !!spinner && (
                                <TableRow>
                                    <TableCell style={{height: 30, padding: 0, border: 0}}
                                               colSpan={cells.length} align="center">
                                        {spinner}
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows && !rows.length && (
                                <TableRow>
                                    <TableCell style={{height: 30, padding: 0}}
                                               colSpan={cells.length} align="center">
                                        Veri yok!
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows?.length && totalRow ? (
                                    <TableRow
                                        hover
                                        tabIndex={-1}
                                        key={rowId(totalRow)}
                                    >
                                        {cells.map((cell) => (
                                            cell.showTotal ?
                                                cell.isRoot ?
                                                    getReactElement(cell, totalRow) :
                                                    <TableCell
                                                        key={rowId(totalRow) + cell.field}
                                                        sx={{padding: 0, pl: 2}}
                                                        align={cell.align}
                                                    >
                                                        {getReactElement(cell, totalRow)}
                                                    </TableCell>
                                                :
                                                <TableCell
                                                    key={rowId(totalRow) + cell.field}
                                                    sx={{padding: 0, pl: 2}}
                                                />
                                        ))}
                                    </TableRow>
                                ) :
                                undefined}
                        </TableBody>
                    </Table>
                </TableContainer>
                {rows?.length && pagination ? (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, {label: 'All', value: -1}]}
                            component="div"
                            count={rows?.length || 0}
                            rowsPerPage={rowsPerPage}
                            labelRowsPerPage=""
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            showFirstButton={true}
                            showLastButton={true}
                        />
                    ) :
                    undefined}
            </Paper>
        </Box>
    );
}

export {CustomTable};
export type {Cell};
export type SortOrder = 'asc' | 'desc';
