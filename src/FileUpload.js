
import React, { Component } from "react";
import * as d3 from "d3";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
  }

  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.props.set_data(json);
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const result = [];

    const parseDate = d3.timeParse("%m/%d/%y");

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",");
      const obj = {};

      headers.forEach((header, index) => {
        if (header.trim() === "Date") {
          obj[header.trim()] = parseDate(currentLine[index].trim());
        } else {
          obj[header.trim()] = parseFloat(currentLine[index]?.trim()) || 0;
        }
      });

      if (Object.keys(obj).length && lines[i].trim()) {
        result.push(obj);
      }
    }

    return result;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input
            type="file"
            accept=".csv"
            onChange={(event) =>
              this.setState({ file: event.target.files[0] })
            }
          />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;