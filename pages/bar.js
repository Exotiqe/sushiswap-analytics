import { Grid, Paper, useTheme } from "@material-ui/core";
import { KPI, Layout, LineChart } from "app/components";
import {
  barHistoriesQuery,
  barQuery,
  getApollo,
  getBar,
  getBarHistories,
  useInterval,
} from "app/core";

import Head from "next/head";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  charts: {
    flexGrow: 1,
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    // textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

function PoolsPage() {
  const classes = useStyles();

  const theme = useTheme();

  const {
    data: { bar },
  } = useQuery(barQuery, {
    context: {
      clientName: "bar",
    },
  });

  const {
    data: { histories },
  } = useQuery(barHistoriesQuery, {
    context: {
      clientName: "bar",
    },
  });

  useInterval(async () => {
    await Promise.all([getBar, getBarHistories]);
  }, 60000);

  const [
    sushiStakedUSD,
    sushiHarvestedUSD,
    xSushiSushi,
    xSushiPerSushi,
    xSushiMinted,
    xSushiBurned,
    xSushiAge,
    xSushiAgeDestroyed,
    xSushi,
  ] = histories.reduce(
    (previousValue, currentValue) => {
      const time = new Date(currentValue.date * 1e3).toISOString().slice(0, 10);
      previousValue[0].push({
        time,
        value: parseFloat(currentValue.sushiStakedUSD),
      });
      previousValue[1].push({
        time,
        value: parseFloat(currentValue.sushiHarvestedUSD),
      });
      previousValue[2].push({
        time,
        value: parseFloat(currentValue.ratio),
      });
      previousValue[3].push({
        time,
        value: 2 - parseFloat(currentValue.ratio),
      });
      previousValue[4].push({
        time,
        value: parseFloat(currentValue.xSushiMinted),
      });
      previousValue[5].push({
        time,
        value: parseFloat(currentValue.xSushiBurned),
      });
      previousValue[6].push({
        time,
        value: parseInt(currentValue.xSushiAge),
        stroke: theme.palette.positive.light,
      });
      previousValue[7].push({
        time,
        value: parseInt(currentValue.xSushiAgeDestroyed),
      });

      previousValue[8].push({
        time,
        value: parseFloat(currentValue.xSushiSupply),
      });

      return previousValue;
    },
    [[], [], [], [], [], [], [], [], []]
  );

  // console.log("xSushiAge", xSushiAge);
  // console.log("xSushiAgeDestroyed", xSushiAgeDestroyed);
  return (
    <Layout>
      <Head>
        <title>Sushi Bar | SushiSwap Analytics</title>
      </Head>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* <Grid item xs>
              <KPI
                title="xSushi Age"
                value={parseFloat(bar.xSushiAge).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs>
              <KPI
                title="xSushi"
                value={parseFloat(bar.totalSupply).toLocaleString()}
              />
            </Grid>
            <Grid item xs>
              <KPI
                title="Sushi"
                value={parseFloat(bar.sushiStaked).toLocaleString()}
              />
            </Grid>
            <Grid item xs>
              <KPI
                title="xSushi:Sushi"
                value={parseFloat(bar.ratio).toLocaleString()}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="xSushi Age & xSushi Age Destroyed"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[xSushiAge, xSushiAgeDestroyed]}
            />
          </Paper>
        </Grid> */}

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="xSushi Total Supply"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[theme.palette.positive.light]}
              lines={[xSushi]}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="Sushi Staked (USD) & Sushi Harvested (USD)"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[sushiStakedUSD, sushiHarvestedUSD]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="xSushi:Sushi & Sushi:xSushi"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[xSushiSushi, xSushiPerSushi]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="xSushi Minted & xSushi Burned"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[xSushiMinted, xSushiBurned]}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* <pre>{JSON.stringify(bar, null, 2)}</pre> */}
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  await getBar();
  await getBarHistories();
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default PoolsPage;