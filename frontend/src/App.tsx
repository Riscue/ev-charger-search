import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import type {Dto} from "./dto.ts";

type Criteria = { filter: string; sortBy: string; order: string };

export default function App() {
    const {shortId} = useParams<{ shortId?: string }>();
    const navigate = useNavigate();

    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState("price");
    const [order, setOrder] = useState("asc");
    const [data, setData] = useState<Dto[]>([]);
    const [searches, setSearches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Eğer shortId varsa kriterleri backend'den çek
    useEffect(() => {
        if (!shortId) return;
        setLoading(true);
        fetch(`http://localhost:4000/searches/${shortId}`)
            .then(r => {
                if (r.status === 404) {
                    navigate("/");
                }
                return r.json();
            })
            .then(res => {
                if (res.criteria) {
                    setFilter(res.criteria.filter || "");
                    setSortBy(res.criteria.sortBy || "price");
                    setOrder(res.criteria.order || "asc");
                }
            })
            .catch(() => navigate("/"))
            .finally(() => setLoading(false));
    }, [shortId]);

    // Data yükleme
    const loadData = () => {
        const url = new URL("http://localhost:4000/data");
        if (filter) url.searchParams.set("filter", filter);
        if (sortBy) url.searchParams.set("sortBy", sortBy);
        if (order) url.searchParams.set("order", order);
        fetch(url).then(r => r.json()).then(setData);
    };

    useEffect(() => {
        loadData();
    }, [filter, sortBy, order]);

    // Arama kaydetme
    const saveSearch = async (visibility: string) => {
        const criteria: Criteria = {filter, sortBy, order};
        const res = await fetch("http://localhost:4000/searches", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({criteria, visibility})
        });
        const {shortId} = await res.json();
        navigate(`/s/${shortId}`);
    };

    useEffect(() => {
        fetch("http://localhost:4000/searches")
            .then(r => r.json())
            .then(setSearches);
    }, []);

    if (loading) return <p>Yükleniyor...</p>;

    return (
        <div className="p-4">
            <h1>Arama</h1>
            <input placeholder="Filtre" value={filter} onChange={e => setFilter(e.target.value)}/>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="firma">Firma</option>
                <option value="acFiyat">Ac Fiyat</option>
                <option value="dcFiyat">Dc Fiyat</option>
            </select>
            <button onClick={() => setOrder(order === "asc" ? "desc" : "asc")}>
                {order}
            </button>
            <button onClick={() => saveSearch("public")}>Kaydet (Public)</button>
            <button onClick={() => saveSearch("private")}>Kaydet (Private)</button>

            <h2 className="mt-4">Sonuçlar</h2>
            <table border={1}>
                <thead>
                <tr>
                    <th>Firma</th>
                    <th>Ac Fiyat</th>
                    <th>Dc Fiyat</th>
                </tr>
                </thead>
                <tbody>
                {data.map(d => (
                    <tr key={d.id}>
                        <td>{d.firma}</td>
                        <td>{d.acFiyat}</td>
                        <td>{d.dcFiyat}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h2 className="mt-4">Public Aramalar</h2>
            <ul>
                {searches.map(s => (
                    <li key={s.short_id}>
                        <a href={`/s/${s.short_id}`}>{s.short_id}</a> ({s.visibility})
                    </li>
                ))}
            </ul>
        </div>
    );
}
