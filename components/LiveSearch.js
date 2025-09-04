// components/LiveSearch.js
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import debounce from "lodash.debounce";
import Image from "next/image";
import useCurrency from "@/hook/useCurrency";

export default function LiveSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const { symbol } = useCurrency();

    const fetchResults = debounce(async (q) => {
        if (!q) {
            setResults([]);
            return;
        }
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}api/products?filters[title][$containsi]=${q}&populate=*`
        );
        const data = await res.json();
        setResults(data.data || []);
    }, 300);

    useEffect(() => {
        fetchResults(query);
        if (query) {
            setShowResults(true);
        } else {
            setShowResults(false);
        }
        return () => {
            fetchResults.cancel();
        };
    }, [query]);

    // 🟢 Detect clicks outside to close results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);



    return (
        <div ref={searchRef} className="">
            <input
                type="text"
                placeholder="Search for games, gift cards and more"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    if (query) setShowResults(true);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none"
            />

            {showResults && (
                results.length > 0 ? (
                    <ul className="absolute left-0 right-0 bg-[#1a1a1a] text-white rounded-lg shadow z-50 mt-5">
                        {results.map((item) => {

                            // const discountPercent = Math.round(
                            //     100 - (item.price / item.originalPrice) * 100
                            // );

                            const discountPercent = Math.round(
                                ((item.price - item.discountPrice) / item.price) * 100
                            );

                            return (
                                <div className="rounded-4xl" key={item.id}>
                                    <li className="flex gap-4 p-3 border-b border-b-[#2a2a2a] hover:bg-[#212121]">
                                        <Link
                                            href={`/product/${item.slug}`}
                                            className="flex gap-4 w-full "
                                            onClick={() => {
                                                setQuery("");   // Clear input
                                                setResults([]); // Clear results
                                            }}
                                        >
                                            {/* Thumbnail */}
                                            <Image
                                                src={item.image.url}
                                                alt={item.title}
                                                height={50}
                                                width={50}
                                                className="w-[72px] h-[102px] object-center rounded"
                                            />

                                            {/* Info */}
                                            <div className="flex flex-col flex-1">
                                                <h3 className="text-s font-semibold mb-2">{item.title}</h3>
                                                <p className="text-s text-blue-400 font-medium mb-0">GLOBAL</p>

                                                {/* Inline price block */}
                                                <div className="flex items-center gap-2 mt-5">
                                                    <span className="text-white font-bold"> {symbol} {item.discountPrice}</span>
                                                    <span className="text-gray-400 line-through text-xs"> {symbol} {item.originalPrice}</span>
                                                    <span className="bg-red-600 text-xs text-white font-semibold px-2 py-0.5 rounded">
                                                        ~{discountPercent}% off
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                </div>
                            );
                        })}
                    </ul>
                ) : (
                    query && (
                        <ul className="absolute left-0 right-0 bg-[#1a1a1a] text-white rounded-lg shadow z-50 mt-5">
                            <li className="p-4 text-center text-gray-400">
                                No products found.
                            </li>
                        </ul>
                    )
                )
            )}
        </div>
    );
}
