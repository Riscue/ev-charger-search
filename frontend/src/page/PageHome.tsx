import React, {useEffect, useState} from 'react';
import changeTitle from "../hooks/change-title";
import Box from "@mui/material/Box";
import {Autocomplete, Chip, Container, Stack, TextField} from "@mui/material";
import {Cell, CustomTable, SortOrder} from "../components/shared/CustomTable";
import {PriceDto} from "../dto/price-dto";
import {PriceAPI} from "../service/KategoriAPI";
import {NumberUtils} from "../utils/number-utils";
import {useNavigate, useParams} from "react-router-dom";
import {Delete} from "@mui/icons-material";

export default function PageHome() {
    changeTitle("Ana Sayfa");
    const navigate = useNavigate();
    const {shortId} = useParams<{ shortId?: string }>();

    const [priceList, setPriceList] = useState<PriceDto[]>();
    const [filteredRows, setFilteredRows] = useState<PriceDto[]>();

    const [options, setOptions] = useState<string[]>([]);
    const [value, setValue] = React.useState<string | null>(null);
    const [inputValue, setInputValue] = React.useState('');

    const [filters, setFilters] = useState<string[]>([]);
    const [orderBy, setOrderBy] = useState<string>("dcFiyat");
    const [order, setOrder] = useState<SortOrder>("asc");

    const [initComplete, setInitComplete] = useState<boolean>(false);

    useEffect(() => {
        PriceAPI.getList().then(data => {
            setOptions(data.map(value => value.firma));
            setPriceList(data);
        });
    }, []);

    useEffect(() => {
        if (shortId) {
            PriceAPI.getSearchData(shortId).then((data) => {
                setFilters(data.filters);
                setOrderBy(data.orderBy);
                setOrder(data.order);
            }).catch(() => {
                navigate("/");
            });
        }
    }, [shortId]);

    useEffect(() => {
        setInitComplete(
            !!priceList
        )
    }, [priceList]);

    useEffect(() => {
        if (filters && filters.length) {
            setFilteredRows(priceList.filter(value => filters.includes(value.firma)));
        } else {
            setFilteredRows(priceList);
        }
    }, [priceList, filters]);

    const priceListCells: Cell[] = [
        {
            label: 'Firma',
            field: 'firma',
            sort: true,
        },
        {
            label: 'AC Fiyat',
            field: 'acFiyat',
            getReactElement: row => <>{NumberUtils.formatMoney(row.acFiyat)}</>,
            sort: true,
        },
        {
            label: 'DC Fiyat',
            field: 'dcFiyat',
            getReactElement: row => <>{NumberUtils.formatMoney(row.dcFiyat)}</>,
            sort: true,
        },
    ];

    return (
        <Container maxWidth={false}>
            <Box sx={{width: 1, p: 2}}>
                <Autocomplete
                    value={value}
                    onChange={(event: any, newValue: string | null) => {
                        if (!filters.includes(newValue)) {
                            const newFilters = structuredClone(filters);
                            newFilters.push(newValue);
                            setFilters(newFilters);
                        }
                        setValue(null);
                        setInputValue('');
                    }}
                    inputValue={inputValue}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    id="controllable-states-demo"
                    options={options}
                    renderInput={(params) => <TextField {...params} label="Firma Listesi"/>}
                />
                <Stack spacing={1} sx={{p: 1}}>
                    {filters.map((rule) => (
                        <Chip
                            key={rule}
                            label={rule}
                            color="primary"
                            size="medium"
                            variant="outlined"
                            deleteIcon={<Delete/>}
                            onDelete={() => setFilters(structuredClone(filters).filter(r => r !== rule))}/>
                    ))}
                </Stack>
            </Box>
            <Box sx={{width: 1, p: 2}}>
                <CustomTable
                    cells={priceListCells}
                    defaultOrderBy={orderBy}
                    defaultOrder={order}
                    rows={initComplete && filteredRows}
                    rowId={row => row.id}
                />
            </Box>
        </Container>
    );
}
