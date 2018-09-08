/**
 * @author Mounica Naidu
 * Created - 24 Aug 2018
 */

/**
 * Dependencies
 * plotly.min.js
 */

var ManyamPlotlyTimeline = function (domElementSelector) {
    this.DOMElementSelector = domElementSelector;
    this.data;
    this.startTimeKey; // base (firstSeenOn) 
    this.endTimeKey; // x end point (lastseenOn)
    this.labelKey;
    this.toolTipKeys;
}

/* Static Configurations */

/* Trace Configuration */
ManyamPlotlyTimeline.traceConfiguration = {
    x: [],
    base: [],
    y: [],
    type: 'bar',
    orientation: 'h',
    hoverinfo: "y+text",
    hovertext: [],
    hoverlabel: {
        bgcolor: '#FFF',
        bordercolor: '#0066a1',
        font: {
            color: '#0066a1'
        }
    }
}

/* Layout Configuration */
ManyamPlotlyTimeline.layoutConfiguration = {
    margin: {
        r: 30,
        b: 50,
        t: 80
    },
    xaxis: {
        type: 'date',
        // mirror: 'all',
        showticklabels: true,
        ticks: 'outside'
    },
    yaxis: {
        type: 'category',
        dtick: 0,
        tickmode: 'array',
        tickvals: [],
        ticktext: [],
        fixedrange: true
    }
}

/* Plot Configuration */
ManyamPlotlyTimeline.plotConfiguration = {
    displayModeBar: true,
    scrollZoom: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["sendDataToCloud", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
}

/* Static functions */

/**
 * Calculate margin width for axis label array. 
 * @param {Array} axisLabels - Label array
 * @param {Int} letterWidth - Default letterwidth = 7
 * @return {Int} - Margin value
 */
ManyamPlotlyTimeline.calculateAxisMargin = function (axisLabels, letterWidth) {
    letterWidth = letterWidth ? letterWidth : 8;
    var maxLabelLength = [];

    axisLabels.forEach(d => {
        maxLabelLength.push(d.length);
    });

    return Math.max(...maxLabelLength) * letterWidth;
}

/**
 * Displays error logs
 * @param {Exception} e 
 */
ManyamPlotlyTimeline.logMessage = function (e) {
    console.info(e);
}

/**
 * Calculate range of date axis with a extra week added
 * @param {JSON} data
 * @returns {Array} range
 */
ManyamPlotlyTimeline.getDateRange = function (data, startDateKey, endDatekey) {
    var startDates = [],
        endDates = [],
        range = [],
        minDate, maxDate;
    var one_week = 1000 * 60 * 60 * 24 * 30;

    data.forEach(dataRecord => {
        startDates.push(dataRecord[startDateKey]);
        endDates.push(dataRecord[endDatekey]);
    });

    startDates.sort();
    endDates.sort();

    if (startDates.length > 0 && endDates.length > 0) {
        minDate = Date.parse(startDates[0]) - one_week;
        maxDate = Date.parse(endDates[endDates.length - 1]) + one_week;
    } else {
        return ['', ''];
    }

    minDate = new Date(minDate);
    maxDate = new Date(maxDate);

    var range_years = [minDate.getFullYear(), maxDate.getFullYear()];
    var range_months = [minDate.getMonth() + 1, maxDate.getMonth() + 1];
    var range_days = [minDate.getDate(), maxDate.getDate()];

    range = [`${range_years[0]}-${range_months[0]}-${range_days[0]}`, `${range_years[1]}-${range_months[1]}-${range_days[1]}`]
    return range;
}

/* Getters and setters */

/**
 * Creates and displays Timeline plot
 * @param {JSON} params.data - Data to be plotted
 * @param {String} params.startTimeKey - Start time key
 * @param {String} params.endTimeKey - End time key
 * @param {String} params.labelKey - Label key to display
 * @param {Array} params.toolTipKeys - Tool tip keys
 */
ManyamPlotlyTimeline.prototype.generateTimelinePlot = function (params) {
    try {
        this.init(params);
        this.plot();

    } catch (e) {
        ManyamPlotlyTimeline.logMessage(e);
    }
    return this;
}

/**
 * Initializes DOM elements
 * @param {JSON} params
 * @param {JSON} params.data - Data to be plotted
 * @param {String} params.startTimeKey - Start time key
 * @param {String} params.endTimeKey - End time key
 * @param {String} params.labelKey - Label key to display
 * @param {Array} params.toolTipKeys - Tool tip keys
 */
ManyamPlotlyTimeline.prototype.init = function (params) {
    try {
        if (!params) {
            params = {};
        }

        /*Initializing values from params sent*/
        this.data = params.data;
        this.startTimeKey = params.startTimeKey;
        this.endTimeKey = params.endTimeKey;
        this.labelKey = params.labelKey;
        this.toolTipKeys = params.toolTipKeys;

    } catch (e) {
        ManyamPlotlyTimeline.logMessage(e);
    }
}

/**
 * Plots timeline
 */
ManyamPlotlyTimeline.prototype.plot = function () {
    try {
        var data = this.data;
        var startTimeKey = this.startTimeKey;
        var endTimeKey = this.endTimeKey;
        var labelKey = this.labelKey;
        var toolTipKeys = this.toolTipKeys;

        var traceData = JSON.parse(JSON.stringify(ManyamPlotlyTimeline.traceConfiguration));
        var layout = JSON.parse(JSON.stringify(ManyamPlotlyTimeline.layoutConfiguration));
        var configuration = JSON.parse(JSON.stringify(ManyamPlotlyTimeline.plotConfiguration));

        var labelKeyIndex = 0;
        var tickvals = [];
        var ticktext = [];
        var lables = [];

        data.forEach(dataRecord => {
            var toolTipText = '';
            /* Data points */
            traceData.base.push(dataRecord[startTimeKey]);
            traceData.x.push(Date.parse(dataRecord[endTimeKey]) - Date.parse(dataRecord[startTimeKey]));
            traceData.y.push(labelKeyIndex);

            /* Hover/Tooltip text */
            for (let index = 0; index < toolTipKeys.length; index++) {
                const toolTipKey = toolTipKeys[index];
                toolTipText += `<b>${toolTipKey}</b>: ${dataRecord[toolTipKey]}<br>`
            }

            traceData.hovertext.push(toolTipText);

            /* Axis tick configs */
            tickvals.push(labelKeyIndex);
            ticktext.push(dataRecord[labelKey]);

            lables.push(dataRecord[labelKey]);

            labelKeyIndex += 1;
        });

        /* Layout config */
        layout.xaxis['range'] = ManyamPlotlyTimeline.getDateRange(data, startTimeKey, endTimeKey);
        layout.yaxis.tickvals = tickvals;
        layout.yaxis.ticktext = ticktext;
        layout.margin["l"] = ManyamPlotlyTimeline.calculateAxisMargin(lables);
        layout["height"] = layout.margin['t'] + (20 * data.length) + layout.margin['b']; // Needed for correct bar height 
        console.log('traceData', traceData);
        Plotly.newPlot(this.DOMElementSelector, [traceData], layout, configuration);

    } catch (e) {
        ManyamPlotlyTimeline.logMessage(e);
    }
}