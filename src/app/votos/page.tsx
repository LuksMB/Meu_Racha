"use client";

import { useEffect, useState } from "react";
import { ref, get, child, update } from "firebase/database";
import { database } from "../../config/firebaseConfig";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Jogador {
  id: string;
  nome: string;
  assistencias: number;
  gols: number;
  votos: number[];
}

const Votacao = () => {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [votos, setVotos] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchJogadores = async () => {
      const dbRef = ref(database);
      try {
        const snapshot = await get(child(dbRef, "jogadores"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const listaJogadores = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setJogadores(listaJogadores);
        }
      } catch (error) {
        console.error("Erro ao buscar jogadores:", error);
      }
    };

    fetchJogadores();
  }, []);

  const handleVoteChange = (jogadorId: string, voto: number) => {
    setVotos((prevVotos) => ({
      ...prevVotos,
      [jogadorId]: voto,
    }));
  };

  const handleSubmit = async () => {
    try {
      const updates: { [key: string]: number[] } = {};
      Object.keys(votos).forEach((jogadorId) => {
        const jogador = jogadores.find((j) => j.id === jogadorId);
        if (jogador) {
          const novosVotos = jogador.votos ? [...jogador.votos, votos[jogadorId]] : [votos[jogadorId]];
          updates[`/jogadores/${jogadorId}/votos`] = novosVotos;
        }
      });
      await update(ref(database), updates);
      alert("Votos registrados com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar votos:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Votação de Jogadores</h1>
      {jogadores.map((jogador) => (
        <Card key={jogador.id} className="mb-4">
          <CardHeader>
            <CardTitle>{jogador.nome}</CardTitle>
            <CardDescription>
              Assistências: {jogador.assistencias} | Gols: {jogador.gols}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              onValueChange={(value) => handleVoteChange(jogador.id, Number(value))}
              className="flex flex-row space-x-4"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={String(value)} id={`r${jogador.id}-${value}`} />
                  <Label htmlFor={`r${jogador.id}-${value}`}>{value} Estrela{value > 1 && 's'}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
      <Button onClick={handleSubmit} className="mt-4">
        Enviar Votos
      </Button>
    </div>
  );
};

export default Votacao;