import {useEffect} from "react";

const TITLE_POSTFIX = "EV Charger Search";

export default function changeTitle(title: string) {
    useEffect(() => {
        document.title = `${title} | ${TITLE_POSTFIX}`;
    }, [title]);
}
