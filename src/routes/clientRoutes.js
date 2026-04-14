// src/routes/clientRoutes.js
import express from "express";

import {
  login,
  getResumo,
  getVulnerabilidades,
  getRiscos,
  getIncidentes
} from "../controllers/clientController.js";

import { getEndpoints } from "../controllers/gravityzoneController.js";

import { autenticarToken } from "../middleware/authMiddleware.js";

import RSSParser from "rss-parser";
const rssParser = new RSSParser();

const router = express.Router();

/*
|--------------------------------------------------------------------------
| 🔐 LOGIN
|--------------------------------------------------------------------------
*/
router.post("/login", login);

/*
|--------------------------------------------------------------------------
| 📊 RESUMO (Dashboard + Máquinas)
|--------------------------------------------------------------------------
*/
router.get("/resumo/:cliente", autenticarToken, getResumo);

/*
|--------------------------------------------------------------------------
| 🛡️ VULNERABILIDADES
|--------------------------------------------------------------------------
*/
router.get("/vulnerabilidades", autenticarToken, getVulnerabilidades);

/*
|--------------------------------------------------------------------------
| ⚠️ RISCOS
|--------------------------------------------------------------------------
*/
router.get("/riscos", autenticarToken, getRiscos);

/*
|--------------------------------------------------------------------------
| 🚨 INCIDENTES
|--------------------------------------------------------------------------
*/
router.get("/incidentes", autenticarToken, getIncidentes);

/*
|--------------------------------------------------------------------------
| �️ GRAVITYZONE
|--------------------------------------------------------------------------
*/
router.get("/gravityzone/endpoints", autenticarToken, getEndpoints);

/*
|--------------------------------------------------------------------------
| �📰 NOTÍCIAS (RSS)
|--------------------------------------------------------------------------
*/
router.get("/noticias", autenticarToken, async (req, res) => {
  try {
    const fontes = [
      {
        nome: "The Hacker News",
        url: "https://feeds.feedburner.com/TheHackersNews"
      },
      {
        nome: "BleepingComputer",
        url: "https://www.bleepingcomputer.com/feed/"
      },
      {
        nome: "CISA",
        url: "https://www.cisa.gov/cybersecurity-advisories/all.xml"
      }
    ];

    let todasNoticias = [];

    for (const fonte of fontes) {
      try {
        const feed = await rssParser.parseURL(fonte.url);

        const noticiasFonte = feed.items.slice(0, 5).map(item => ({
          titulo: item.title || "Sem título",
          descricao: item.contentSnippet || item.content || "",
          link: item.link,
          dataPublicacao: item.pubDate || item.isoDate || null,
          fonte: fonte.nome
        }));

        todasNoticias = todasNoticias.concat(noticiasFonte);

      } catch (err) {
        console.error(`Erro no RSS (${fonte.nome}):`, err.message);
      }
    }

    todasNoticias.sort((a, b) => {
      const da = a.dataPublicacao ? new Date(a.dataPublicacao).getTime() : 0;
      const db = b.dataPublicacao ? new Date(b.dataPublicacao).getTime() : 0;
      return db - da;
    });

    todasNoticias = todasNoticias.slice(0, 12);

    return res.json({ noticias: todasNoticias });

  } catch (err) {
    console.error("Erro na rota /noticias:", err);
    return res.status(500).json({ erro: "Falha ao buscar notícias" });
  }
});

/*
|--------------------------------------------------------------------------
| EXPORTAR ROTAS
|--------------------------------------------------------------------------
*/
export default router;
