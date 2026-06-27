import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const PORT = 3000;
const PROFILE_FILE = "/private/tmp/faithflix-mf7-profile.txt";

const users = {
    anonymous: null,
    user: {
        id: "u-user",
        name: "Utilizador Teste",
        email: "user@faithflix.test",
        role: "user",
    },
    moderator: {
        id: "u-moderator",
        name: "Moderador Teste",
        email: "moderador@faithflix.test",
        role: "moderator",
    },
    admin: {
        id: "u-admin",
        name: "Admin Teste",
        email: "admin@faithflix.test",
        role: "admin",
    },
};

function getProfileFromRequest(req) {
    try {
        const profileFromFile = readFileSync(PROFILE_FILE, "utf8").trim();

        if (Object.hasOwn(users, profileFromFile)) {
            return profileFromFile;
        }
    } catch {
        // O ficheiro temporario so existe durante a recolha de evidence browser.
    }

    const referer = req.headers.referer ?? "";

    try {
        const refererUrl = new URL(referer);
        const profile = refererUrl.searchParams.get("mf7Profile");
        return Object.hasOwn(users, profile) ? profile : "anonymous";
    } catch {
        return "anonymous";
    }
}

const sampleContent = [
    {
        id: "64f200000000000000000001",
        slug: "filme-piloto-fe",
        type: "Filme",
        title: "Filme piloto de fé",
        synopsis: "Conteúdo de demonstração para validação visual da MF7.",
        ratingAverage: 4.6,
        posterUrl: "",
        status: "published",
    },
    {
        id: "64f200000000000000000002",
        slug: "documentario-esperanca",
        type: "Documentário",
        title: "Documentário Esperança",
        synopsis: "Outro conteúdo publicado para validar cards e grelha.",
        ratingAverage: 4.2,
        posterUrl: "",
        status: "published",
    },
];

function sendJson(res, body, statusCode = 200, origin = "*") {
    res.writeHead(statusCode, {
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
        "access-control-allow-origin": origin,
        "content-type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
    const origin = req.headers.origin ?? "http://127.0.0.1:4176";
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "access-control-allow-credentials": "true",
            "access-control-allow-headers": "content-type",
            "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
            "access-control-allow-origin": origin,
        });
        res.end();
        return;
    }

    const activeProfile = getProfileFromRequest(req);

    if (url.pathname === "/api/session/me") {
        sendJson(res, { user: users[activeProfile] }, 200, origin);
        return;
    }

    if (url.pathname === "/api") {
        sendJson(res, { name: "FaithFlix API", status: "ok" }, 200, origin);
        return;
    }

    if (url.pathname === "/api/discovery/home") {
        sendJson(
            res,
            {
                carousels: [
                    { id: "featured", title: "Em destaque", items: sampleContent },
                    {
                        id: "recommended",
                        title: "Recomendações simples",
                        items: sampleContent.slice(0, 1),
                    },
                ],
            },
            200,
            origin,
        );
        return;
    }

    if (url.pathname === "/api/catalog/admin") {
        if (!["admin", "moderator"].includes(activeProfile)) {
            sendJson(res, { message: "Permissão insuficiente." }, 403, origin);
            return;
        }
        sendJson(res, { items: sampleContent }, 200, origin);
        return;
    }

    if (url.pathname === "/api/catalog") {
        sendJson(res, { items: sampleContent, total: sampleContent.length }, 200, origin);
        return;
    }

    if (url.pathname === "/api/catalog/taxonomies") {
        sendJson(res, { genres: [], themes: [], audiences: [] }, 200, origin);
        return;
    }

    sendJson(res, { message: "Fixture visual MF7" }, 200, origin);
});

server.listen(PORT, "127.0.0.1", () => {
    console.log(`FaithFlix MF7 mock API ready at http://127.0.0.1:${PORT}`);
});
