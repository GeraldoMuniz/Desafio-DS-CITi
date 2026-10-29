import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as plantaRepository from "../repositories/PlantaRepository";

export const createPlanta = async (req: Request, res: Response) => {
    try {
        const { nome, preco, estoque, petFriendly, luminosidade, regaACadaDias } = req.body;

        if (
            typeof nome !== "string" || nome.trim() === "" ||
            !Number.isInteger(preco) || preco <= 0 ||
            !Number.isInteger(estoque) || estoque < 0 ||
            typeof petFriendly !== "boolean" ||
            !Object.values(Luminosidade).includes(luminosidade) ||
            (regaACadaDias !== undefined && (!Number.isInteger(regaACadaDias) || regaACadaDias < 1))
        ) {
            return res.status(400).json({ error: "Dados inválidos ou incompletos para o cadastro da planta." });
        }

        const novaPlanta = await plantaRepository.createPlanta({
            nome,
            preco,
            estoque,
            petFriendly,
            luminosidade,
            ...(regaACadaDias !== undefined && { regaACadaDias }),
        });

        return res.status(201).json(novaPlanta);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao criar planta." });
    }
};

export const findAllPlantas = async (req: Request, res: Response) => {
    try {
        const { luminosidade, petFriendly } = req.query;

        let luminosidadeFilter: Luminosidade | undefined = undefined;
        let petFriendlyFilter: boolean | undefined = undefined;

        if (luminosidade !== undefined) {
            if (!Object.values(Luminosidade).includes(luminosidade as Luminosidade)) {
                return res.status(400).json({ error: "Filtro de luminosidade inválido." });
            }
            luminosidadeFilter = luminosidade as Luminosidade;
        }

        if (petFriendly !== undefined) {
            if (petFriendly === "true") petFriendlyFilter = true;
            else if (petFriendly === "false") petFriendlyFilter = false;
            else {
                return res.status(400).json({ error: "Filtro petFriendly inválido." });
            }
        }

        const plantas = await plantaRepository.findAllPlantas({
            luminosidade: luminosidadeFilter,
            petFriendly: petFriendlyFilter,
        });

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

        const { nome, preco, estoque, petFriendly, luminosidade, regaACadaDias } = req.body;
        const dadosAtualizados: any = {};

        if (nome !== undefined) {
            if (typeof nome !== "string" || nome.trim() === "") {
                return res.status(400).json({ error: "Nome inválido." });
            }
            dadosAtualizados.nome = nome;
        }

        if (preco !== undefined) {
            if (!Number.isInteger(preco) || preco <= 0) {
                return res.status(400).json({ error: "Preço inválido." });
            }
            dadosAtualizados.preco = preco;
        }

        if (estoque !== undefined) {
            if (!Number.isInteger(estoque) || estoque < 0) {
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

        if (regaACadaDias !== undefined) {
            if (!Number.isInteger(regaACadaDias) || regaACadaDias < 1) {
                return res.status(400).json({ error: "regaACadaDias inválido." });
            }
            dadosAtualizados.regaACadaDias = regaACadaDias;
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

export const realizarVenda = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { quantidade } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "ID inválido." });
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            return res.status(400).json({ error: "Quantidade inválida para venda." });
        }

        const planta = await plantaRepository.findPlantaById(id);
        if (!planta) {
            return res.status(404).json({ error: "Planta não encontrada." });
        }

        if (planta.estoque < quantidade) {
            return res.status(400).json({ error: "Estoque insuficiente para realizar a venda." });
        }

        const novoEstoque = planta.estoque - quantidade;

        const plantaAtualizada = await plantaRepository.updatePlanta(id, {
            estoque: novoEstoque,
        });

        return res.status(200).json(plantaAtualizada);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao realizar venda." });
    }
};

export const getValorTotalEstoque = async (req: Request, res: Response) => {
    try {
        const plantas = await plantaRepository.findAllPlantas({});

        let valorTotalEmCentavos = 0;
        let totalDeVasos = 0;

        for (const planta of plantas) {
            valorTotalEmCentavos += planta.preco * planta.estoque;
            totalDeVasos += planta.estoque;
        }

        return res.status(200).json({
            valorTotalEmCentavos,
            totalDeVasos,
        });
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao calcular valor total do estoque." });
    }
};

export const findPlantasEsgotadas = async (req: Request, res: Response) => {
    try {
        const plantasEsgotadas = await plantaRepository.findPlantasEsgotadas();
        return res.status(200).json(plantasEsgotadas);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao buscar plantas esgotadas." });
    }
};

export const realizarVenda = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { quantidade } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "ID inválido." });
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            return res.status(400).json({ error: "Quantidade inválida para venda." });
        }

        const planta = await plantaRepository.findPlantaById(id);
        if (!planta) {
            return res.status(404).json({ error: "Planta não encontrada." });
        }

        if (planta.estoque < quantidade) {
            return res.status(400).json({ error: "Estoque insuficiente para realizar a venda." });
        }

        const plantaAtualizada = await plantaRepository.decrementarEstoquePlanta(id, quantidade);

        return res.status(200).json(plantaAtualizada);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao realizar venda." });
    }
};