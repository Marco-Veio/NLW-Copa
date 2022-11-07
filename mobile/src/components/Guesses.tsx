import { useEffect, useState } from "react";

import { FlatList, useToast } from "native-base";

import { EmptyMyPollList } from "./EmptyMyPollList";
import { Game, GameProps } from "./Game";
import { Loading } from "./Loading";

import { api } from "../services/api";

interface Props {
  pollId: string;
  pollCode: string;
}

export function Guesses({ pollId, pollCode }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState([] as GameProps[]);
  const [firstTeamPoints, setFirstTeamPoints] = useState("");
  const [secondTeamPoints, setSecondTeamPoints] = useState("");

  const toast = useToast();

  useEffect(() => {
    fetchGames();
  }, [pollId]);

  async function fetchGames() {
    try {
      setIsLoading(true);
      const response = await api.get(`/polls/${pollId}/games`);
      setGames(response.data.games);
    } catch (error) {
      console.log(error);

      toast.show({
        title: "Erro ao carregar os jogos",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuessConfirm(gameId: string) {
    try {
      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: "Preencha o palpite",
          placement: "top",
          bgColor: "red.500",
        });
      }

      await api.post(`/polls/${pollId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      });

      toast.show({
        title: "Palpite enviado",
        placement: "top",
        bgColor: "green.500",
      });

      fetchGames();
    } catch (error) {
      console.log(error);

      toast.show({
        title: "Erro ao enviar palpite",
        placement: "top",
        bgColor: "red.500",
      });
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.id}
      _contentContainerStyle={{ pb: 40 }}
      ListEmptyComponent={<EmptyMyPollList code={pollCode} />}
      renderItem={({ item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
    />
  );
}
