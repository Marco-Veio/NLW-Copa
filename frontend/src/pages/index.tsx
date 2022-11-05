import { FormEvent, useState } from "react";

import Image from "next/image";

import appPreviewImage from "../assets/app-nlw-copa-preview.png";
import logoImage from "../assets/logo.svg";
import avatarImage from "../assets/users-avatar-example.png";
import iconCheckImage from "../assets/icon-check.svg";

import { api } from "../lib/axios";

interface Props {
  poolCount: number;
  guessCount: number;
  userCount: number;
}

export default function Home(props: Props) {
  const [name, setName] = useState("");

  function createPool(event: FormEvent) {
    event.preventDefault();
    api
      .post("/pools", {
        title: name,
      })
      .then((response) => {
        setName("");
        navigator.clipboard
          .writeText(response.data.code)
          .then(() =>
            alert(
              "Bolão criado com sucesso! O código foi copiado para a área de transferência!"
            )
          );
      })
      .catch((error) => {
        console.log(error);
        alert("Falha ao criar o bolão, tente novamente");
      });
  }

  return (
    <div className="max-w-[1124px] h-screen mx-auto grid grid-cols-2 gap-28 items-center">
      <main>
        <Image src={logoImage} alt="Logo NLW Copa" />
        <h1 className="mt-14 text-white text-5xl font-bold leading-tight">
          Crie seu próprio bolão da copa e compartilhe entre amigos!
        </h1>

        <div className="mt-10 flex items-center gap-2">
          <Image src={avatarImage} alt="Avatar de usuários" />
          <strong className="text-gray-100 text-xl">
            <span className="text-ignite-500">+{props.userCount}</span> pessoas
            já estão usando
          </strong>
        </div>

        <form className="mt-10 flex gap-2" onSubmit={createPool}>
          <input
            className="flex-1 px-6 py-4 rounded bg-gray-800 border border-gray-600 text-sm text-gray-100"
            type="text"
            required
            placeholder="Qual o nome do seu bolão?"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button
            className="bg-yellow-500 px-6 py-4 rounded text-gray-900 font-bold text-sm uppercase hover:bg-yellow-700"
            type="submit"
          >
            Criar meu bolão
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-300 leading-relaxed">
          Após criar seu bolão, você receberá um código único que poderá usar
          para convidar outras pessoas 🚀
        </p>

        <div className="mt-10 pt-10 border-t border-gray-600 flex justify-between items-center text-gray-100">
          <div className="flex items-center gap-6">
            <Image src={iconCheckImage} alt="Ícone de check" />
            <div className="flex flex-col">
              <span className="font-bold text-2xl">+{props.poolCount}</span>
              <span>Bolões criados</span>
            </div>
          </div>

          <div className="w-px h-14 bg-gray-600" />

          <div className="flex items-center gap-6">
            <Image src={iconCheckImage} alt="Ícone de check" />
            <div className="flex flex-col">
              <span className="font-bold text-2xl">+{props.guessCount}</span>
              <span>Palpites enviados</span>
            </div>
          </div>
        </div>
      </main>

      <Image
        src={appPreviewImage}
        alt="Dois celulares exibindo uma prévia da aplicação móvel do NLW Copa"
        quality={100}
      />
    </div>
  );
}

export async function getStaticProps() {
  const [pools, guesses, users] = await Promise.all([
    api.get("pools/count"),
    api.get("guesses/count"),
    api.get("users/count"),
  ]);

  return {
    props: {
      poolCount: pools.data.count,
      guessCount: guesses.data.count,
      userCount: users.data.count,
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
}
