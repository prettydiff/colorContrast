/*global document, localStorage*/
(function () {
    "use strict";
    var settings     = {},
        error        = function (message) {
            var err = document.getElementById("error");
            err.innerHTML     = "<strong>Error:</strong> " + message;
            err.style.display = "block";
        },
        luminance    = function (rgb) {
            var convert = function (x) {
                    if (x === 0) {
                        return 0;
                    }
                    x = (x / 255);
                    if ((x * 100000) <= 3928) {
                        return ((x * 100) / 1292) * 10000;
                    }
                    x *= 100000;
                    return Math.pow((((x + 5500) / 105500)), 2.4) * 10000;
                };
            return ((2126 * convert(rgb[0])) + (7152 * convert(rgb[1])) + (722 * convert(rgb[2]))) / 100000000;
        },
        hexToDec     = function (color) {
            if (typeof color !== "string" || (color.length !== 4 && color.length !== 7)) {
                error("The value <em>" + color + "</em> does not appear to be a valid color hex code.");
                return [];
            }
            color = color.toLowerCase().slice(1);
            if ((/^([0-9a-f]+)$/).test(color) === false) {
                error("The value <em>" + color + "</em> does not appear to be a valid color hex code.");
                return [];
            }
            if (color.length === 3) {
                color = color.charAt(0) + color.charAt(0) + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2);
            }
            return [
                parseInt(color.charAt(0) + color.charAt(1), 16), parseInt(color.charAt(2) + color.charAt(3), 16), parseInt(color.charAt(4) + color.charAt(5), 16)
            ];
        },
        setContrast  = function () {
            var node = this;
            if (typeof node === "object" && node.nodeType === 1) {
                settings[node.getAttribute("name")] = node.getAttribute("id");
            }
            if (settings.compliance === "compliance-aa") {
                if (settings.strictness === "strictness-strict") {
                    settings.contrast = 4.5;
                } else {
                    settings.contrast = 3;
                }
            } else {
                if (settings.strictness === "strictness-strict") {
                    settings.contrast = 7.1;
                } else {
                    settings.contrast = 4.5;
                }
            }
            document.getElementById("combinations").getElementsByTagName("strong")[0].innerHTML = settings.contrast + " : 1";
            if (node !== undefined) {
                localStorage.colorContrast = JSON.stringify(settings);
            }
        },
        schemeData   = function () {
            var selectedColor = settings.selectedColor,
                colorSchemes  = settings.colorSchemes,
                option        = {},
                select        = document.getElementById("color-scheme"),
                len           = colorSchemes.length,
                a             = 0;
            select.innerHTML = "";
            colorSchemes.sort(function (a, b) {
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            });
            for (a = 0; a < len; a += 1) {
                option           = document.createElement("option");
                option.value     = colorSchemes[a].value.replace(/\,/g, ", ");
                option.innerHTML = colorSchemes[a].name;
                if (colorSchemes[a].name === "New") {
                    select.insertBefore(option, select.firstChild);
                } else {
                    select.appendChild(option);
                }
                if (colorSchemes[a].name === selectedColor) {
                    select.selectedIndex = select.getElementsByTagName("option").length - 1;
                }
            }
        },
        schemeModify = function () {
            var schemeName = document.getElementById("scheme-name").value,
                a          = 0,
                schemes    = settings.colorSchemes,
                text       = document.getElementById("color-input");
            if (schemeName === "" || text.value === "") {
                return;
            }
            for (a = schemes.length - 1; a > -1; a -= 1) {
                if (schemeName === schemes[a].name && schemeName !== "New") {
                    schemes[a].value = text.value.replace(/\s+/g, "").replace(/\,$/, "");
                    break;
                }
            }
            if (a < 0) {
                schemes.push({
                    name : schemeName,
                    value: text.value.replace(/\s+/g, "").replace(/\,$/, "")
                });
            }
            text.value             = text.value.replace(/\,$/, "");
            settings.selectedColor = schemeName;
            schemeData();
            localStorage.colorContrast = JSON.stringify(settings);
        },
        schemeChange = function () {
            var node = document.getElementById("color-scheme"),
                indx = node[node.selectedIndex];
            document.getElementById("color-input").value = indx.value;
            if (indx.innerHTML === "New") {
                document.getElementById("scheme-name").value = "";
            } else {
                document.getElementById("scheme-name").value = indx.innerHTML;
            }
            settings.selectedColor     = indx.innerHTML;
            localStorage.colorContrast = JSON.stringify(settings);
        },
        render       = function () {
            var text   = document.getElementById("color-input").value,
                data   = [],
                obj    = {},
                failed = (document.getElementById("fail-yes").checked === true) ? true : false,
                values = text.replace(/\s+/g, "").split(","),
                a      = 0,
                b      = 0,
                li     = {},
                lis    = {},
                p      = {},
                ps     = {},
                pass   = {},
                fail   = {},
                ratio  = 0,
                any    = false,
                classy = "",
                output = document.getElementById("output"),
                sort   = function (aa, bb) {
                    if (aa.lum - bb.lum > 0) {
                        return 1;
                    }
                    return 0;
                },
                len    = values.length;
            if (settings.selectedColor !== "New") {
                (function () {
                    var colors = settings.colorSchemes,
                        aa     = 0;
                    for (a = colors.length - 1; aa > -1; aa -= 1) {
                        if (colors[aa].name === settings.selectedColor) {
                            if (colors[aa].value.replace(/\s+/g, "") === text.replace(/\s+/g, "")) {
                                document.getElementById("combinations").getElementsByTagName("h2")[0].innerHTML = "Available color combinations for <em>" + colors[aa].name + "</em>";
                            } else {
                                document.getElementById("combinations").getElementsByTagName("h2")[0].innerHTML = "Available color combinations";
                            }
                            return;
                        }
                    }
                }());
            } else {
                document.getElementById("combinations").getElementsByTagName("h2")[0].innerHTML = "Available color combinations";
            }
            output.innerHTML                               = "";
            document.getElementById("error").style.display = "none";
            if (values.length < 2) {
                return;
            }
            for (a = 0; a < len; a += 1) {
                if (values[a].length === 0) {
                    values.splice(a, 1);
                    len -= 1;
                    if (a === len) {
                        break;
                    }
                }
                obj       = {};
                obj.value = values[a];
                obj.rgb   = hexToDec(obj.value);
                obj.lum   = (luminance(obj.rgb) * 1000);
                data.push(obj);
            }
            data.sort(sort);
            for (a = 0; a < len; a += 1) {
                li          = document.createElement("li");
                pass        = document.createElement("ul");
                fail        = document.createElement("ul");
                p           = document.createElement("p");
                p.innerHTML = data[a].value;
                li.appendChild(p);
                pass.setAttribute("class", "pass");
                fail.setAttribute("class", "fail");
                if (data[a].lum > 500) {
                    classy = "light";
                } else {
                    classy = "dark";
                }
                li.setAttribute("class", classy);
                li.style.background = data[a].value;
                for (b = 0; b < len; b += 1) {
                    if (a !== b) {
                        if (data[a].lum === data[b].lum) {
                            data.splice(b, 1);
                            len -= 1;
                        } else {
                            ratio = (data[a].lum > data[b].lum) ? ((data[a].lum + 50) / (data[b].lum + 50)) : ((data[b].lum + 50) / (data[a].lum + 50));
                            if (ratio >= settings.contrast) {
                                lis          = document.createElement("li");
                                ps           = document.createElement("p");
                                ps.innerHTML = data[b].value + " <span>" + (Math.round(ratio * 10) / 10) + " : 1</span>";
                                lis.appendChild(ps);
                                lis.style.background = data[b].value;
                                lis.style.color      = data[a].value;
                                lis.setAttribute("class", classy);
                                pass.appendChild(lis);
                                any = true;
                            } else if (failed === true) {
                                lis          = document.createElement("li");
                                ps           = document.createElement("p");
                                ps.innerHTML = data[b].value + " <span>" + (Math.round(ratio * 10) / 10) + " : 1</span>";
                                lis.appendChild(ps);
                                lis.style.background = data[b].value;
                                lis.setAttribute("class", classy);
                                fail.appendChild(lis);
                            }
                        }
                    }
                }
                if (failed === true) {
                    p           = document.createElement("p");
                    p.innerHTML = "Passed color contrast";
                    p.setAttribute("class", "passfail");
                    li.appendChild(p);
                    li.appendChild(pass);
                    if (fail.childNodes.length === 0) {
                        fail.innerHTML = "<li class='exception'>This color does not sufficiently contrast with the other colors.</li>";
                    }
                    p           = document.createElement("p");
                    p.innerHTML = "Failed color contrast";
                    p.setAttribute("class", "passfail");
                    li.appendChild(p);
                    li.appendChild(fail);
                } else {
                    if (pass.childNodes.length === 0) {
                        pass.innerHTML = "<li class='exception'>This color does not sufficiently contrast with the other colors.</li>";
                    }
                    li.appendChild(pass);
                }
                output.appendChild(li);
            }
            if (any === false && failed === false) {
                output.innerHTML = "<li class='exception'>None of the colors sufficiently contrast.</li>";
            }
        };
    (function () {
        var radios = document.getElementsByTagName("input"),
            a      = 0;
        settings = (localStorage.colorContrast === undefined) ? {} : JSON.parse(localStorage.colorContrast);
        if (settings.colorSchemes === undefined) {
            settings                   = {
                colorSchemes : [
                    {
                        name : "New",
                        value: ""
                    }, {
                        name : "Southwest - Vision",
                        value: "#d5152e,#ffbf27,#304cb2,#111b40,#ff792e,#008522,#0076a5,#a4baf2,#294299,#1a2c80,#636363,#8f8f8f,#ccc,#e6e7e8,#f5f5f5,#fff"
                    }
                ],
                compliance   : "compliance-aa",
                contrast     : 4.5,
                fail         : "fail-no",
                selectedColor: "New",
                strictness   : "strictness-strict"
            };
            localStorage.colorContrast = JSON.stringify(settings);
        }
        schemeData();
        document.getElementById("color-scheme").onchange = schemeChange;
        schemeChange();
        for (a = radios.length - 1; a > -1; a -= 1) {
            if (radios[a].getAttribute("type") === "radio") {
                radios[a].onclick = setContrast;
                if (radios[a].checked === true) {
                    settings[radios[a].getAttribute("name")] = radios[a].getAttribute("id");
                }
            }
        }
        document.getElementById("submit").onclick        = render;
        document.getElementById("scheme-modify").onclick = schemeModify;
        setContrast();
        if (settings.selectedColor !== "New") {
            render();
        }
    }());
}());