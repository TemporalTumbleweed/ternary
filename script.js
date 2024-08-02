const width = 750;
const height = 663;
const padding = 50;

const svg = d3.select("#ternaryPlot")
    .attr("width", width)
    .attr("height", height);

const sideLength = width - 2 * padding;
const triangleHeight = (Math.sqrt(3) / 2) * sideLength;
const triangleData = [
    {x: padding, y: height - padding},
    {x: width - padding, y: height - padding},
    {x: width / 2, y: height - padding - triangleHeight}
];

const colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 255]);

const color = (baryCoords, colorA, colorB, colorC) => {
    const r = baryCoords[0] * colorA[0] + baryCoords[1] * colorB[0] + baryCoords[2] * colorC[0];
    const g = baryCoords[0] * colorA[1] + baryCoords[1] * colorB[1] + baryCoords[2] * colorC[1];
    const b = baryCoords[0] * colorA[2] + baryCoords[1] * colorB[2] + baryCoords[2] * colorC[2];
    return `rgb(${r}, ${g}, ${b})`;
};

const barycentricCoords = (p, a, b, c) => {
    const v0 = [b.x - a.x, b.y - a.y];
    const v1 = [c.x - a.x, c.y - a.y];
    const v2 = [p.x - a.x, p.y - a.y];
    const d00 = v0[0] * v0[0] + v0[1] * v0[1];
    const d01 = v0[0] * v1[0] + v0[1] * v1[1];
    const d11 = v1[0] * v1[0] + v1[1] * v1[1];
    const d20 = v2[0] * v0[0] + v2[1] * v0[1];
    const d21 = v2[0] * v1[0] + v2[1] * v1[1];
    const denom = d00 * d11 - d01 * d01;
    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    const u = 1 - v - w;
    return [u, v, w];
};

const points = (a, b, c) => {
    const denominator = a + b + c;
    const x = 0.5 * (2 * b + c) / denominator;
    const y = (Math.sqrt(3) / 2) * (c / denominator);
    return {x: x * sideLength + padding, y: height - (y * sideLength + padding)};
};

d3.csv("output.csv").then(data => {
    // Sort data by scale in descending order
    data.sort((a, b) => b.scale - a.scale);
    
    svg.append("polygon")
        .attr("points", triangleData.map(d => [d.x, d.y].join(",")).join(" "))
        .attr("fill", "black")
        .attr("class", "triangle");

    // Add median lines
    const medianLines = [
        {x1: triangleData[0].x, y1: triangleData[0].y, x2: (triangleData[1].x + triangleData[2].x) / 2, y2: (triangleData[1].y + triangleData[2].y) / 2},
        {x1: triangleData[1].x, y1: triangleData[1].y, x2: (triangleData[0].x + triangleData[2].x) / 2, y2: (triangleData[0].y + triangleData[2].y) / 2},
        {x1: triangleData[2].x, y1: triangleData[2].y, x2: (triangleData[0].x + triangleData[1].x) / 2, y2: (triangleData[0].y + triangleData[1].y) / 2}
    ];

    medianLines.forEach(line => {
        svg.append("line")
            .attr("x1", line.x1)
            .attr("y1", line.y1)
            .attr("x2", line.x2)
            .attr("y2", line.y2)
            .attr("stroke", "black")
            .attr("stroke-dasharray", "8 4")
            .attr("class", "median");
    });

    const tableBody = d3.select("#wordTable tbody");

    data.forEach((d, i) => {
        const a = +d["donald-trump"];
        const b = +d["kamala-harris"];
        const c = +d["rfk-jr"];
        const scale = +d["scale"];
        const word = d["word"];

        const p = points(a, b, c);
        const baryCoords = barycentricCoords(p, triangleData[0], triangleData[1], triangleData[2]);
        const fillColor = color(baryCoords, [232, 27, 35], [0, 174, 243], [255, 255, 255]);

        svg.append("circle")
            .attr("cx", p.x)
            .attr("cy", p.y)
            .attr("r", scale * 2.5 * sideLength)
            .attr("stroke", fillColor)
            .attr("fill", fillColor)
            .attr("class", "circle")
            .attr("data-index", i)
            .on("mouseover", () => highlightRow(i))
            .on("mouseout", () => removeHighlight(i))
            .on("click", () => scrollToRow(i));

        // Check if the point is not on any vertex before adding text
        const isOnVertex = triangleData.some(vertex => p.x === vertex.x && p.y === vertex.y);

        if (!isOnVertex && scale * 10 * sideLength > 15) {
            svg.append("text")
                .attr("x", p.x)
                .attr("y", p.y)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("class", "text")
                .text(word);
        }

        const row = tableBody.append("tr")
            .attr("data-index", i)
            .on("mouseover", () => highlightDot(i))
            .on("mouseout", () => removeHighlight(i));

        row.append("td").text(word);
        row.append("td").text(Math.round(a * 100) / 100);
        row.append("td").text(Math.round(b * 100) / 100);
        row.append("td").text(Math.round(c * 100) / 100);
        row.append("td").text(Math.round(scale * 100000) / 100);
    });

    // Bottom edge scale
    var bottomScale = d3.scaleLinear()
        .domain([0, 1])
        .range([triangleData[0].x, triangleData[1].x]);

    var bottomTickValues = bottomScale.ticks(10);

    var bottomAxis = d3.axisBottom(bottomScale)
        .tickValues(bottomTickValues);

    var bottomAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(bottomAxis);

    // Right edge scale
    var rightScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, sideLength]);

    var rightTickValues = rightScale.ticks(10);

    var rightAxis = d3.axisRight(rightScale)
        .tickValues(rightTickValues);

    var rightAxisGroup = svg.append("g")
        .attr("transform", `translate(${triangleData[2].x}, ${triangleData[2].y}) rotate(-30)`)
        .call(rightAxis);

    // Left edge scale
    var leftScale = d3.scaleLinear()
        .domain([1, 0])
        .range([0, sideLength]);

    var leftTickValues = leftScale.ticks(10);

    var leftAxis = d3.axisLeft(leftScale)
        .tickValues(leftTickValues);

    var leftAxisGroup = svg.append("g")
        .attr("transform", `translate(${triangleData[2].x}, ${triangleData[2].y}) rotate(30)`)
        .call(leftAxis);

    const highlightDot = (index) => {
        d3.select(`circle[data-index='${index}']`).classed("highlight", true);
        d3.select(`tr[data-index='${index}']`).classed("highlight", true);
    };

    const highlightRow = (index) => {
        d3.select(`circle[data-index='${index}']`).classed("highlight", true);
        d3.select(`tr[data-index='${index}']`).classed("highlight", true);
    };

    const removeHighlight = (index) => {
        d3.select(`circle[data-index='${index}']`).classed("highlight", false);
        d3.select(`tr[data-index='${index}']`).classed("highlight", false);
    };

    const scrollToRow = (index) => {
        const row = tableBody.select(`tr[data-index='${index}']`).node();
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightRow(index);
    };

    d3.select("#search").on("input", function() {
        const searchText = this.value.toLowerCase();
        tableBody.selectAll("tr").each(function(d, i) {
            const row = d3.select(this);
            const word = row.select("td").text().toLowerCase();
            row.style("display", word.includes(searchText) ? null : "none");
        });
    });
});

function changeContent(contentId) {
    const tabs = document.querySelectorAll('#tabs div');
    tabs.forEach(tab => tab.classList.remove('active-tab'));

    const contents = document.querySelectorAll('#side-content > div');
    contents.forEach(content => content.style.display = 'none');

    document.getElementById(contentId).style.display = 'block';
    document.getElementById(`tab${contentId[contentId.length - 1]}`).classList.add('active-tab');
}
