import React, {useEffect, useState} from 'react';
import Box from "@mui/material/Box";
import {Autocomplete, Chip, Container, Slider, TextField} from "@mui/material";
import {Cell, CustomTable, SortOrder} from "../components/shared/CustomTable";
import {PriceDto} from "../dto/price-dto";
import {PriceAPI} from "../service/KategoriAPI";
import {NumberUtils} from "../utils/number-utils";
import {useNavigate, useParams} from "react-router-dom";
import {Delete} from "@mui/icons-material";
import Button from "@mui/material/Button";
import {SearchDto} from "../dto/search-dto";
import {TITLE_POSTFIX} from "../utils/constants";

export type Socket = 'AC' | 'DC' | 'ALL';

export default function PageHome() {
    const navigate = useNavigate();
    const {shortId} = useParams<{ shortId?: string }>();

    const [priceList, setPriceList] = useState<PriceDto[]>();
    const [filteredRows, setFilteredRows] = useState<PriceDto[]>();

    const [options, setOptions] = useState<string[]>([]);
    const [value, setValue] = React.useState<string | null>(null);
    const [inputValue, setInputValue] = React.useState('');

    const [name, setName] = useState<string>('');
    const [filters, setFilters] = useState<string[]>([]);
    const [sortField, setSortField] = useState<string>("dcFiyat");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [priceRange, setPriceRange] = React.useState<number[]>([0, 20]);
    const [socket, setSocket] = React.useState<Socket>("ALL");

    const [initComplete, setInitComplete] = useState<boolean>(false);

    useEffect(() => {
        PriceAPI.getList().then(data => {
            setOptions(data.map(value => value.name));
            setPriceList(data);
        });
    }, []);

    useEffect(() => {
        if (shortId) {
            PriceAPI.getSearchData(shortId).then((data: SearchDto) => {
                document.title = `${data.name || data.shortId} | ${TITLE_POSTFIX}`;
                setName(data.name || '');
                setFilters(data.criteria);
                setSortField(data.sortField);
                setSortOrder(data.sortOrder);
                setPriceRange([data.priceMin, data.priceMax]);
                setSocket(data.socket);
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
        if (priceList) {
            let tempList = structuredClone(priceList);
            if (filters?.length) {
                tempList = tempList.filter(value => filters.includes(value.name))
            }
            if (priceRange) {
                tempList = tempList.filter(value => (socket != 'DC' && priceRange[0] < value.ac && value.ac < priceRange[1]) || (socket != 'AC' && priceRange[0] < value.dc && value.dc < priceRange[1]))
            }
            setFilteredRows(tempList);
        } else {
            setFilteredRows([]);
        }
    }, [priceList, filters, priceRange, socket]);

    function save() {
        if (filters?.length || (priceRange[0] > 0 || priceRange[1] < 20) || socket != 'ALL') {
            PriceAPI.save(name, filters, sortField, sortOrder, priceRange, socket).then((data) => {
                navigate(`/s/${data}`);
            });
        }
    }

    function clear() {
        navigate("/");
    }

    function handleRequestSort(sortField: string, sortOrder: SortOrder) {
        setSortField(sortField);
        setSortOrder(sortOrder);
    }

    function handleChange(event: Event, newValue: number[]) {
        setPriceRange([Math.round(newValue[0] * 10) / 10, Math.round(newValue[1] * 10) / 10]);
    }

    function handleSocketChange() {
        setSocket(socket === 'ALL' ? 'DC' : socket === 'DC' ? 'AC' : 'ALL')
    }

    function formatPriceRangeLabel(value: number) {
        return `${value}₺`;
    }

    const priceListCells: Cell[] = [
        {
            label: 'Firma',
            field: 'name',
            sort: true,
        },
        {
            label: 'AC Fiyat',
            field: 'ac',
            getReactElement: row => <>{NumberUtils.formatMoney(row.ac)}</>,
            sort: true,
        },
        {
            label: 'DC Fiyat',
            field: 'dc',
            getReactElement: row => <>{NumberUtils.formatMoney(row.dc)}</>,
            sort: true,
        },
    ];

    return (
        <Container maxWidth={false}>
            <Box sx={{width: 1, p: 2, mt: 5}}>
                <Button value="check" onClick={handleSocketChange}>{socket}</Button>
                <Slider
                    value={priceRange}
                    onChange={handleChange}
                    valueLabelDisplay="on"
                    step={0.1}
                    min={0}
                    max={20}
                    valueLabelFormat={formatPriceRangeLabel}
                />
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
                    renderInput={(params) => <TextField {...params}
                                                        label={filters.length ? `${filters.length} adet firma seçildi` : 'Firma Listesi'}/>}
                />
                <Box sx={{width: 1, my: 1}}>
                    {filters.map((rule) => (
                        <Chip
                            sx={{m: .2}}
                            key={rule}
                            label={rule}
                            color="primary"
                            size="medium"
                            variant="outlined"
                            deleteIcon={<Delete/>}
                            onDelete={() => setFilters(structuredClone(filters).filter(r => r !== rule))}/>
                    ))}
                </Box>

                <Box>
                    <TextField
                        label="İsim"
                        value={name}
                        onChange={(event) => setName(event.target.value)}/>
                </Box>

                <Box sx={{mt: 1}}>
                    <Button variant="outlined" type="button" onClick={() => save()}>Kaydet</Button>
                    <Button variant="outlined" type="button" onClick={() => clear()}>Temizle</Button>
                </Box>
            </Box>
            <Box sx={{width: 1, p: 2}}>
                <CustomTable
                    cells={priceListCells}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    handleRequestSort={handleRequestSort}
                    rows={initComplete && filteredRows}
                    rowId={row => row.id}
                />
            </Box>
        </Container>
    );
}
