import api from "@/api/api";
import useSWR from "swr";
import { Button, Grid, Link as MuiLink } from "@material-ui/core";
import Loading from "@/components/Loading";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import styled from "styled-components";
import styles from "@/styles/Advices.module.css";
import Input from "@mui/material/Input";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";

const fetcher = (url) => api.get(url).then((res) => res.data);

const schema = yup.object().shape({
  word: yup.string().required(),
});

const AdvicesPage = ({ advice }) => {
  const [adviceList, setAdviceList] = useState([]);
  const [alert, setAlert] = useState("");
  const [adv, setAdv] = useState(advice);
  const [parameter, setParameter] = useState(null);
  const [advicesList, setAdvicesList] = useState(null);
  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data, error } = useSWR("/advice/search/" + parameter, fetcher);

  if (error) {
    return "Ocurrió un error" + error;
  }

  if (!data) {
    return <Loading />;
  }

  if (!advice) {
    return <Loading />;
  }

  const handleSaveAdvice = (adviceItem) => {
    let count = 0;
    for (let i = 0; i < adviceList.length; i++) {
      if (adviceList[i].id === adviceItem.id) {
        count++;
      }
    }
    if (count === 0) {
      setAdviceList([...adviceList, adviceItem]);
    } else {
      setAlert("Consejo ya agregado, escoja otro");
    }
  };
  const handleChange = async () => {
    const res = await api.get(`/advice`);
    setAdv(res.data);
  };

  const onSearch = async (values) => {
    setParameter(values.word);
    reset();
    getList();
  };

  const handleRemove = (adviceItem) => {
    setAdviceList((prevState) =>
      prevState.filter((adviceList, index) => index !== adviceItem.id)
    );
  };

  const getList = async () => {
    setAdvicesList(data.slips);
  };

  return (
    <div className={styles.Advices}>
      <StyledGrid container spacing={2}>
        <Grid item xs={6}>
          <h1>Consejo del día</h1>
          <Advice>{adv.slip.advice}</Advice>
          <StyledButton
            onClick={() => handleSaveAdvice(adv.slip)}
            color="primary"
            variant="contained"
          >
            Marcar como favorito
          </StyledButton>
          <StyledButton
            onClick={handleChange}
            color="primary"
            variant="contained"
          >
            <SearchIcon /> Siguiente consejo
          </StyledButton>
          {alert !== "" && <h6>{alert}</h6>}
        </Grid>
        <Grid item xs={6}>
          <h1>Consejos favoritos</h1>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableBody>
                {adviceList.map((ad) => (
                  <TableRow
                    key={ad.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {ad.advice}
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <StyledButton
                        onClick={() => handleRemove(ad)}
                        color="primary"
                        variant="contained"
                      >
                        Quitar de la lista
                      </StyledButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </StyledGrid>
      <Divider />
      <StyledGrid container spacing={12} alignContent="center">
        <Grid direction="column" item xs={12}>
          <h1>Buscador de consejos</h1>
        </Grid>
        <Grid direction="column" item xs={12}>
          <h6>Palabra clave </h6>
          <form onSubmit={handleSubmit(onSearch)}>
            <div>
              <Controller
                name="word"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Playlist Name"
                    variant="standard"
                    size="small"
                  />
                )}
              />
            </div>
            <Button
              type="submit"
              className={styles.Buttons}
              color="primary"
              variant="contained"
            >
              <SearchIcon /> Buscar
            </Button>
          </form>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Tetxo</TableCell>
                  <TableCell align="right">Opcion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parameter === null ? (
                  <div>Busca consejos</div>
                ) : data.message ? (
                  <div>No hay resultados para su busqueda</div>
                ) : (
                  data &&
                  data.slips.map((ad) => (
                    <TableRow
                      key={ad.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {ad.advice}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <StyledButton
                          onClick={() => handleSaveAdvice(ad)}
                          color="primary"
                          variant="contained"
                        >
                          Marcar como favorito
                        </StyledButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </StyledGrid>
    </div>
  );
};

export default AdvicesPage;

export async function getStaticProps() {
  let advice = [];
  try {
    const response = await api.get("/advice");
    console.log("response", response);
    advice = response.data;
  } catch (e) {
    console.log("e", e);
  }

  return {
    props: {
      advice,
    }, // will be passed to the page component as props
  };
}
const Advice = styled.h3`
  font-weight: lighter;
`;
const StyledGrid = styled(Grid)`
  align-items: "center";
  margin: 0 auto;
  text-align: center;
`;
const StyledButton = styled(Button)`
  background-color: aquamarine;
  color: aliceblue;
`;
