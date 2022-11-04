import axios from "axios";

interface Props {
  count: number;
}

export default function Home(props: Props) {
  return <h1>Contagem {props.count}</h1>;
}

export async function getServerSideProps() {
  const res = await axios.get("http://localhost:3333/pools/count");

  return {
    props: {
      count: res.data.count,
    },
  };
}
