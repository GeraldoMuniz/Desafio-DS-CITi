import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as plantaRepository from "../repositories/PlantaRepository";

export const createPlanta = async (req: Request, res: Response) => {
    try {
        const { nome, preco, estoque, petFriendly, luminosidade } = req.body;

        if (
            typeof nome !== "string" || nome.trim() === "" ||
            !Number.isInteger(preco) ||
            !Number.isInteger(estoque) ||
            typeof petFriendly !== "boolean" ||
            !Object.values(Luminosidade).includes(luminosidade)
        ) {
            return res.status(400).json({ error: "Dados inválidos ou incompletos para o cadastro da planta." });
        }

        const novaPlanta = await plantaRepository.createPlanta({
            nome,
            preco,
            estoque,
            petFriendly,
            luminosidade,
        });

        return res.status(201).json(novaPlanta);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao criar planta." });
    }
};

export const findAllPlantas = async (req: Request, res: Response) => {
    try {
        const plantas = await plantaRepository.findAllPlantas();
        return res.status(200).json(plantas);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao listar plantas." });
    }
};

export const findPlantaById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "ID inválido." });
        }

        const planta = await plantaRepository.findPlantaById(id);

        if (!planta) {
            return res.status(404).json({ error: "Planta não encontrada." });
        }

        return res.status(200).json(planta);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao buscar planta." });
    }
};

export const updatePlanta = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "ID inválido." });
        }

        const plantaExistente = await plantaRepository.findPlantaById(id);
        if (!plantaExistente) {
            return res.status(404).json({ error: "Planta não encontrada para atualização." });
        }

        const { nome, preco, estoque, petFriendly, luminosidade } = req.body;
        const dadosAtualizados: any = {};

        if (nome !== undefined) {
            if (typeof nome !== "string" || nome.trim() === "") {
                return res.status(400).json({ error: "Nome inválido." });
            }
            dadosAtualizados.nome = nome;
        }

        if (preco !== undefined) {
            if (!Number.isInteger(preco)) {
                return res.status(400).json({ error: "Preço inválido." });
            }
            dadosAtualizados.preco = preco;
        }

        if (estoque !== undefined) {
            if (!Number.isInteger(estoque)) {
                return res.status(400).json({ error: "Estoque inválido." });
            }
            dadosAtualizados.estoque = estoque;
        }

        if (petFriendly !== undefined) {
            if (typeof petFriendly !== "boolean") {
                return res.status(400).json({ error: "Valor de petFriendly inválido." });
            }
            dadosAtualizados.petFriendly = petFriendly;
        }

        if (luminosidade !== undefined) {
            if (!Object.values(Luminosidade).includes(luminosidade)) {
                return res.status(400).json({ error: "Luminosidade inválida." });
            }
            dadosAtualizados.luminosidade = luminosidade;
        }

        const plantaAtualizada = await plantaRepository.updatePlanta(id, dadosAtualizados);

        return res.status(200).json(plantaAtualizada);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao atualizar planta." });
    }
};

export const deletePlanta = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "ID inválido." });
        }

        const plantaExistente = await plantaRepository.findPlantaById(id);
        if (!plantaExistente) {
            return res.status(404).json({ error: "Planta não encontrada para exclusão." });
        }

        await plantaRepository.deletePlanta(id);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao deletar planta." });
    }
};