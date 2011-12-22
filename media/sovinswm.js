/*
 * Sovereign Insolvency World Map
 *
 * Copyright (C) Brian M Hunt 2011.
 */
'use strict';

function log(msg) {
    $("#msg").append("<div>" + msg + "</div>");
}

var siwm = siwm || (function () {
    var vectorMapSettings = {
            backgroundColor: "#111",
            color: "#666",
            hoverColor: '#DD0'
        },
        _tt_cache = {};

    /*
     * Return a jQuery element (not in the DOM) with the content of the
     * tooltip for a particular country.
     */
    function _tooltip_content(crises_map, country_code, country_name) {
        var country_crises,
            tt_html = _tt_cache[country_code]; // tooltip html

        if (tt_html !== undefined) {
            return tt_html;
        }

        country_crises = crises_map[country_code];

        // no crises for this country.
        if (country_crises === undefined) {
            tt_html = $("<div><header>" + country_name + "</header></div>");
            tt_html.append("No history of default.");
            return tt_html;
        }

        tt_html = $("<div><header>" + country_name + "</header></div>");

        country_crises.sort(function (a, b) {
            return parseInt(a.Year) - parseInt(b.Year);
        });

        $.each(country_crises, function (i, crisis) {
            var crisis_html = $("<div class='crisis'></div>");

            crisis_html.append("<span class='year'>" + crisis.Year 
                               + "</span> ");

            if (crisis.Comment !== null) {
                crisis_html.append("<span class='comment'>"
                    + crisis.Comment + "</span>");
            }

            if (crisis.Amount !== null && $.trim(crisis.Amount) !== '') {
                crisis_html.append("<br style='clear:both'/>Amount (million): <span class=amt>" +
                    crisis.Amount + "</span>");
            }

            tt_html.append(crisis_html)
                .append($("<br style='clear:both'/>"));
        });

        _tt_cache[country_code] = tt_html; // save cache.
        return tt_html;
    } // _tooltip_content

    /*
     * Show the tooltip for this Country
     *
    function _show_tooltip(crises_map, country_code, country_name) {
        $("#map, h2").qtip({
            content: "HEY", //tt_html,
            position: {
                my: 'top left',
                target: 'mouse',
                viewport: $(window),
                adjust: {
                    x: 10, y: 10
                }
            },
            hide: {
                fixed: true
            },
            style: 'ui-tooltip-shadow'
        }); // qtip
    } // _show_tooltip
    // */

    /*
     * Given data from the server, update the map
     */
    function _update_map(data) {
        /* 
         * Crises: [Crisis, ...]
         *
         * Crisis: {
         *  Comment: ... (for tooltip)
         *  Country: Country name
         *  Source: how we know about the default
         *  Year: year of the default
         *  Amount (million): amount of the default
         * }
         */
        var crises = data['data'],
            crises_map = {},
            colors = {},
            labels = {};

        /**
         * Add country code to crises map
         *     ~~~~~~~~~~~~
         */
        $.each(crises, function (i, crisis) {
            var country_code;

            if (crisis.Country === null) {
                log("Invalid crisis data: " + JSON.stringify(crisis));
                return;
            }
            
            country_code = name_to_iso3166(crisis.Country);
            crises[i]._cc = country_code; // map crisis to country code
            crisis.Amount = crisis['Amount (million)']; // shorthand
            colors[country_code] = '#F00'; // highlight countries w/ default
            if (crises_map[country_code] === undefined) {
                crises_map[country_code] = []; // a list of crises by country
            }
            crises_map[country_code].push(crisis);
        }); // each crisis

        /*
         * Set colors
         *     ~~~~~~
         */
        $("#map").vectorMap('set', 'colors', colors);

        /*
         * Set labels
         *     ~~~~~~
         */
        $("#map").bind('labelShow.jvectormap', function (event, label, code) {
            label.html(_tooltip_content(crises_map, code, label.text()));
            return true;
            //_show_tooltip(crises_map, code, label.text());
            //event.preventDefault();
            //return false;
        });

    } // _update_map

    function update() {
        $.get("/data", _update_map);
        $("#map").vectorMap(vectorMapSettings);
    } // update

    /*
     * Convert a Country name to its ISO3166 code
     */
    function name_to_iso3166(country_name) {
        var name,
            cc;

        name = $.trim(country_name.toUpperCase());
        cc   = siwm._iso3166[name];

        if (cc === undefined) {
            log("Country \"" + name + "\" has no iso3166 code");
            return '';
        } 

        return cc.toLowerCase();
    } // name_to_iso3166

    return {
        update: update
    };
})();

/*
 * Mapping of canonical and colloquial country names to their
 * ISO3166 (alpha-2) codes.
 */
siwm._iso3166 = {
	"AFGHANISTAN": "AF",
	"�LAND ISLANDS": "AX",
	"ALBANIA": "AL",
	"ALGERIA": "DZ",
	"AMERICAN SAMOA": "AS",
	"ANDORRA": "AD",
	"ANGOLA": "AO",
	"ANGUILLA": "AI",
	"ANTARCTICA": "AQ",
	"ANTIGUA AND BARBUDA": "AG",
	"ARGENTINA": "AR",
	"ARMENIA": "AM",
	"ARUBA": "AW",
	"AUSTRALIA": "AU",
	"AUSTRIA": "AT",
	"AZERBAIJAN": "AZ",
	"BAHAMAS": "BS",
	"BAHRAIN": "BH",
	"BANGLADESH": "BD",
	"BARBADOS": "BB",
	"BELARUS": "BY",
	"BELGIUM": "BE",
	"BELIZE": "BZ",
	"BENIN": "BJ",
	"BERMUDA": "BM",
	"BHUTAN": "BT",
	"BOLIVIA, PLURINATIONAL STATE OF": "BO",
    "BOLIVIA": "BO",
	"BONAIRE, SINT EUSTATIUS AND SABA": "BQ",
	"BOSNIA AND HERZEGOVINA": "BA",
	"BOTSWANA": "BW",
	"BOUVET ISLAND": "BV",
	"BRAZIL": "BR",
	"BRITISH INDIAN OCEAN TERRITORY": "IO",
	"BRUNEI DARUSSALAM": "BN",
	"BULGARIA": "BG",
	"BURKINA FASO": "BF",
	"BURUNDI": "BI",
	"CAMBODIA": "KH",
	"CAMEROON": "CM",
	"CANADA": "CA",
	"CAPE VERDE": "CV",
	"CAYMAN ISLANDS": "KY",
	"CENTRAL AFRICAN REPUBLIC": "CF",
	"CHAD": "TD",
	"CHILE": "CL",
	"CHINA": "CN",
	"CHRISTMAS ISLAND": "CX",
	"COCOS (KEELING) ISLANDS": "CC",
	"COLOMBIA": "CO",
	"COMOROS": "KM",
	"CONGO": "CG",
	"CONGO, THE DEMOCRATIC REPUBLIC OF THE": "CD",
	"COOK ISLANDS": "CK",
	"COSTA RICA": "CR",
	"COTE D'IVOIRE": "CI",
	"CROATIA": "HR",
	"CUBA": "CU",
	"CURA�AO": "CW",
	"CYPRUS": "CY",
	"CZECH REPUBLIC": "CZ",
	"DENMARK": "DK",
	"DJIBOUTI": "DJ",
	"DOMINICA": "DM",
	"DOMINICAN REPUBLIC": "DO",
	"ECUADOR": "EC",
	"EGYPT": "EG",
	"EL SALVADOR": "SV",
	"EQUATORIAL GUINEA": "GQ",
	"ERITREA": "ER",
	"ESTONIA": "EE",
	"ETHIOPIA": "ET",
	"FALKLAND ISLANDS (MALVINAS)": "FK",
	"FAROE ISLANDS": "FO",
	"FIJI": "FJ",
	"FINLAND": "FI",
	"FRANCE": "FR",
	"FRENCH GUIANA": "GF",
	"FRENCH POLYNESIA": "PF",
	"FRENCH SOUTHERN TERRITORIES": "TF",
	"GABON": "GA",
	"GAMBIA": "GM",
	"GEORGIA": "GE",
	"GERMANY": "DE",
	"GHANA": "GH",
	"GIBRALTAR": "GI",
	"GREECE": "GR",
	"GREENLAND": "GL",
	"GRENADA": "GD",
	"GUADELOUPE": "GP",
	"GUAM": "GU",
	"GUATEMALA": "GT",
	"GUERNSEY": "GG",
	"GUINEA": "GN",
	"GUINEA-BISSAU": "GW",
	"GUYANA": "GY",
	"HAITI": "HT",
	"HEARD ISLAND AND MCDONALD ISLANDS": "HM",
	"HOLY SEE (VATICAN CITY STATE)": "VA",
	"HONDURAS": "HN",
	"HONG KONG": "HK",
	"HUNGARY": "HU",
	"ICELAND": "IS",
	"INDIA": "IN",
	"INDONESIA": "ID",
	"IRAN, ISLAMIC REPUBLIC OF": "IR",
	"IRAN": "IR",
	"IRAQ": "IQ",
	"IRELAND": "IE",
	"ISLE OF MAN": "IM",
	"ISRAEL": "IL",
	"ITALY": "IT",
	"JAMAICA": "JM",
	"JAPAN": "JP",
	"JERSEY": "JE",
	"JORDAN": "JO",
	"KAZAKHSTAN": "KZ",
	"KENYA": "KE",
	"KIRIBATI": "KI",
	"KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF": "KP",
	"KOREA, REPUBLIC OF": "KR",
	"KUWAIT": "KW",
	"KYRGYZSTAN": "KG",
	"LAO PEOPLE'S DEMOCRATIC REPUBLIC": "LA",
	"LATVIA": "LV",
	"LEBANON": "LB",
	"LESOTHO": "LS",
	"LIBERIA": "LR",
	"LIBYA": "LY",
	"LIECHTENSTEIN": "LI",
	"LITHUANIA": "LT",
	"LUXEMBOURG": "LU",
	"MACAO": "MO",
	"MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF": "MK",
	"MACEDONIA": "MK",
	"MADAGASCAR": "MG",
	"MALAWI": "MW",
	"MALAYSIA": "MY",
	"MALDIVES": "MV",
	"MALI": "ML",
	"MALTA": "MT",
	"MARSHALL ISLANDS": "MH",
	"MARTINIQUE": "MQ",
	"MAURITANIA": "MR",
	"MAURITIUS": "MU",
	"MAYOTTE": "YT",
	"MEXICO": "MX",
	"MICRONESIA, FEDERATED STATES OF": "FM",
	"MOLDOVA, REPUBLIC OF": "MD",
	"MOLDOVA": "MD",
	"MONACO": "MC",
	"MONGOLIA": "MN",
	"MONTENEGRO": "ME",
	"MONTSERRAT": "MS",
	"MOROCCO": "MA",
	"MOZAMBIQUE": "MZ",
	"MYANMAR": "MM",
	"NAMIBIA": "NA",
	"NAURU": "NR",
	"NEPAL": "NP",
	"NETHERLANDS": "NL",
	"THE NETHERLANDS": "NL",
	"NEW CALEDONIA": "NC",
	"NEW ZEALAND": "NZ",
	"NICARAGUA": "NI",
	"NIGER": "NE",
	"NIGERIA": "NG",
	"NIUE": "NU",
	"NORFOLK ISLAND": "NF",
	"NORTHERN MARIANA ISLANDS": "MP",
	"NORWAY": "NO",
	"OMAN": "OM",
	"PAKISTAN": "PK",
	"PALAU": "PW",
	"PALESTINIAN TERRITORY, OCCUPIED": "PS",
	"PANAMA": "PA",
	"PAPUA NEW GUINEA": "PG",
	"PARAGUAY": "PY",
	"PERU": "PE",
	"PHILIPPINES": "PH",
	"THE PHILIPPINES": "PH",
	"PITCAIRN": "PN",
	"POLAND": "PL",
	"PORTUGAL": "PT",
	"PUERTO RICO": "PR",
	"QATAR": "QA",
	"R�UNION": "RE",
	"ROMANIA": "RO",
	"RUSSIAN FEDERATION": "RU",
	"RUSSIA": "RU",
	"RWANDA": "RW",
	"SAINT BARTH�LEMY": "BL",
	"SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA": "SH",
	"SAINT KITTS AND NEVIS": "KN",
	"SAINT LUCIA": "LC",
	"SAINT MARTIN (FRENCH PART)": "MF",
	"SAINT PIERRE AND MIQUELON": "PM",
	"SAINT VINCENT AND THE GRENADINES": "VC",
	"SAMOA": "WS",
	"SAN MARINO": "SM",
	"SAO TOME AND PRINCIPE": "ST",
	"SAUDI ARABIA": "SA",
	"SENEGAL": "SN",
	"SERBIA": "RS",
	"SEYCHELLES": "SC",
	"SIERRA LEONE": "SL",
	"SINGAPORE": "SG",
	"SINT MAARTEN (DUTCH PART)": "SX",
	"SLOVAKIA": "SK",
	"SLOVENIA": "SI",
	"SOLOMON ISLANDS": "SB",
	"SOMALIA": "SO",
	"SOUTH AFRICA": "ZA",
	"SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS": "GS",
	"SOUTH SUDAN": "SS",
	"SPAIN": "ES",
	"SRI LANKA": "LK",
	"SUDAN": "SD",
	"SURINAME": "SR",
	"SVALBARD AND JAN MAYEN": "SJ",
	"SWAZILAND": "SZ",
	"SWEDEN": "SE",
	"SWITZERLAND": "CH",
	"SYRIAN ARAB REPUBLIC": "SY",
	"TAIWAN, PROVINCE OF CHINA": "TW",
	"TAJIKISTAN": "TJ",
	"TANZANIA, UNITED REPUBLIC OF": "TZ",
	"THAILAND": "TH",
	"TIMOR-LESTE": "TL",
	"TOGO": "TG",
	"TOKELAU": "TK",
	"TONGA": "TO",
	"TRINIDAD AND TOBAGO": "TT",
	"TUNISIA": "TN",
	"TURKEY": "TR",
	"TURKMENISTAN": "TM",
	"TURKS AND CAICOS ISLANDS": "TC",
	"TUVALU": "TV",
	"UGANDA": "UG",
	"UKRAINE": "UA",
	"UNITED ARAB EMIRATES": "AE",
	"UNITED KINGDOM": "GB",
	"UNITED STATES": "US",
	"UNITED STATES OF AMERICA": "US",
	"USA": "US",
	"UNITED STATES MINOR OUTLYING ISLANDS": "UM",
	"URUGUAY": "UY",
	"UZBEKISTAN": "UZ",
	"VANUATU": "VU",
	"VENEZUELA, BOLIVARIAN REPUBLIC OF": "VE",
	"VENEZUELA": "VE",
	"VIET NAM": "VN",
	"VIETNAM": "VN",
	"VIRGIN ISLANDS, BRITISH": "VG",
	"VIRGIN ISLANDS, U.S.": "VI",
	"WALLIS AND FUTUNA": "WF",
	"WESTERN SAHARA": "EH",
	"YEMEN": "YE",
	"ZAMBIA": "ZM",
	"ZIMBABWE": "ZW"
}; // iso3166 map
