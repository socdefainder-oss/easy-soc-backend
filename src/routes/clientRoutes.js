// src/routes/clientRoutes.js
import express from "express";
import { getResumo, login } from "../controllers/clientController.js";
import { autenticarToken } from "../middleware/authMiddleware.js";
import RSSParser from "rss-parser";

const router = express.Router();
const rssParser = new RSSParser();

/*
|--------------------------------------------------------------------------
| ROTAS DE AUTENTICAÇÃO
|--------------------------------------------------------------------------
*/

// Login
router.post("/login", login);

/*
|--------------------------------------------------------------------------
| ROTAS PRINCIPAIS (Resumo / Máquinas / Etc)
|--------------------------------------------------------------------------
*/

// Dashboard resumo
router.get("/resumo/:cliente", autenticarToken, getResumo);


/*
|--------------------------------------------------------------------------
| ROTA DE NOTÍCIAS - /api/noticias
|--------------------------------------------------------------------------
|
| Esta rota busca notícias de segurança em fontes confiáveis via RSS.
| Requer token no header Authorization: Bearer <token>.
|
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

    // Processar todas as fontes
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
        console.error(`Erro ao processar RSS (${fonte.nome}):`, err.message);
      }
    }

    // Ordenar por data (maior para menor)
    todasNoticias.sort((a, b) => {
      const da = a.dataPublicacao ? new Date(a.dataPublicacao).getTime() : 0;
      const db = b.dataPublicacao ? new Date(b.dataPublicacao).getTime() : 0;
      return db - da;
    });

    // Limitar às 12 mais recentes
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
