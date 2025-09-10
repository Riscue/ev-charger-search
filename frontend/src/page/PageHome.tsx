import React, {useEffect, useState} from 'react';
import Box from "@mui/material/Box";
import {Accordion, AccordionDetails, AccordionSummary, Autocomplete, Chip, Container, Slider, TextField} from "@mui/material";
import {Cell, CustomTable, SortOrder} from "../components/shared/CustomTable";
import {PriceDto} from "../dto/price-dto";
import {PriceAPI} from "../service/KategoriAPI";
import {NumberUtils} from "../utils/number-utils";
import {useNavigate, useParams} from "react-router-dom";
import {Delete, ExpandMore} from "@mui/icons-material";
import Button from "@mui/material/Button";
import {SearchDto} from "../dto/search-dto";
import {TITLE_POSTFIX} from "../utils/constants";
import Typography from "@mui/material/Typography";

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
    const [sortField, setSortField] = useState<string>("dc");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [priceRange, setPriceRange] = React.useState<number[]>([0, 20]);
    const [socket, setSocket] = React.useState<Socket>("ALL");

    const [expanded, setExpanded] = React.useState<boolean>(false);

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
        } else {
            setExpanded(true);
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
            if (socket) {
                tempList = tempList.filter(value => (socket != 'DC' && value.ac) || (socket != 'AC' && value.dc))
            }
            if (priceRange) {
                tempList = tempList.filter(value => (socket != 'DC' && priceRange[0] <= value.ac && value.ac <= priceRange[1]) || (socket != 'AC' && priceRange[0] <= value.dc && value.dc <= priceRange[1]))
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
        if (shortId) {
            navigate("/");
        } else {
            setName("");
            setFilters([]);
            setSortField(undefined);
            setSortOrder("asc");
            setPriceRange([0, 20]);
            setSocket("ALL");
        }
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

    function filtreToText() {
        const parts: string[] = [];

        if (filters.length > 0) {
            parts.push(`${filters.length} firma seçildi`);
        }

        if (sortField) {
            const sortLabel =
                sortField === "dc"
                    ? "DC Fiyat"
                    : sortField === "ac"
                        ? "AC Fiyat"
                        : "İsim";
            const orderLabel = sortOrder === "asc" ? "Düşükten Yükseğe" : "Yüksekten Düşüğe";
            parts.push(`Sıralama: ${sortLabel} (${orderLabel})`);
        }

        if (priceRange.length === 2) {
            if (priceRange[0] == 0 && priceRange[1] != 20) {
                parts.push(`Fiyat <= ${priceRange[1]}`);
            } else if (priceRange[0] != 0 && priceRange[1] == 20) {
                parts.push(`${priceRange[0]} <= Fiyat`);
            } else if (priceRange[0] != 0 && priceRange[1] != 20) {
                parts.push(`${priceRange[0]} <= Fiyat <= ${priceRange[1]}`);
            }
        }

        if (socket !== "ALL") {
            parts.push(`Soket: ${socket}`);
        }

        return parts.join(" | ");
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
                <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                    <AccordionSummary
                        expandIcon={<ExpandMore/>}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography sx={{width: '33%'}}>Filtre</Typography>
                        <Typography sx={{color: 'text.secondary'}}>
                            {filtreToText()}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Button value="check" onClick={handleSocketChange}>Soket: {socket}</Button>
                        <Slider
                            value={priceRange}
                            onChange={handleChange}
                            valueLabelDisplay="auto"
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
                    </AccordionDetails>
                </Accordion>
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
