import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  componentDidMount() {
    if (this.props.csv_data.length > 0) this.createStreamGraph(this.props.csv_data);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.csv_data !== this.props.csv_data) {
      d3.select("#streamgraph").selectAll("svg").remove();
      this.createStreamGraph(this.props.csv_data);
    }
  }

  createStreamGraph = (data) => {
    d3.select("#streamgraph").selectAll("svg").remove();

    const models = ["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"];
    const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];

    const margin = { top: 20, right: 150, bottom: 50, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const stack = d3.stack().keys(models).order(d3.stackOrderNone).offset(d3.stackOffsetWiggle);
    const layers = stack(data);

    const x = d3.scaleTime().domain(d3.extent(data, (d) => d.Date)).range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(layers, (layer) => d3.min(layer, (d) => d[0])),
        d3.max(layers, (layer) => d3.max(layer, (d) => d[1])),
      ])
      .range([height, 0]);

    const area = d3
      .area().x((d) => x(d.data.Date)).y0((d) => y(d[0])).y1((d) => y(d[1])).curve(d3.curveBasis);

    const svg = d3
      .select("#streamgraph").append("svg").attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom).append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll(".layer").data(layers).enter().append("path").attr("class", "layer").attr("d", area).style("fill", (d, i) => colors[i]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b"))
      )
      .selectAll("text").style("text-anchor", "middle").style("font-size", "12px");


    const tooltip = d3.select("#streamgraph").append("div").attr("class", "tooltip").style("opacity", 0);

    const createMiniBarChart = (tooltip, model, modelData, color) => {
      tooltip.select("svg").remove();

      const margin = { top: 10, right: 10, bottom: 30, left: 30 };
      const width = 250 - margin.left - margin.right;
      const height = 150 - margin.top - margin.bottom; 

      const svg = tooltip
        .append("svg")
        .attr("class", "mini-bar-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand().domain(modelData.map((d) => d3.timeFormat("%b")(d.Date))).range([0, width]).padding(0.1);

      const y = d3.scaleLinear().domain([0, d3.max(modelData, (d) => d[model])]).range([height, 0]);

      svg
        .selectAll(".bar")
        .data(modelData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d3.timeFormat("%b")(d.Date)))
        .attr("y", (d) => y(d[model]))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(d[model]))
        .attr("fill", color);

      // X-axis for mini bar
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "10px");

      // Y-axis for mini bar
      svg.append("g").call(d3.axisLeft(y).ticks(6).tickSize(0));
    };

    svg.selectAll(".layer")
      .on("mousemove", (event, layer) => {

        const modelIndex = layers.indexOf(layer);
        const model = models[modelIndex];
        const hoveredData = data.map((d) => ({
          Date: d.Date,
          [model]: d[model],
        }));

        tooltip
          .style("opacity", 1)
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 120}px`);

        createMiniBarChart(tooltip, model, hoveredData, colors[modelIndex]);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0).select(".mini-bar-chart").remove();
      });

    const legend = svg.append("g").attr("transform", `translate(${width + 20}, 10)`);

    const reversedmodels = [...models].reverse();
    const reversedColors = [...colors].reverse();

    reversedmodels.forEach((key, i) => {
      const legendRow = legend.append("g").attr("transform", `translate(0,${i * 20})`);

      legendRow.append("rect").attr("width", 15).attr("height", 15).attr("fill", reversedColors[i]);

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text(key);
    });
  };

  render() {
    return <div id="streamgraph"></div>;
  }
}

export default Child1;