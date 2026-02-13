import ReactSpeedometer from "react-d3-speedometer/slim";

function ScoreMeter({ scoreValue }) {

    return (
        <>
            <div className="flex justify-center items-center">
                <ReactSpeedometer
                    needleHeightRatio={0.6}
                    maxSegmentLabels={4} // Adjusted to match the number of segments
                    segments={4} // Number of segments
                    customSegmentStops={[0, 620, 700, 750, 900]}
                    segmentColors={['#fe0f17', '#ffd700', '#32cd32', '#0de20d']} // Adjusted to match the segments
                    value={scoreValue}
                    maxValue={900} // Explicitly set the max value
                    textColor={"#000000"}
                    customSegmentLabels={[
                        {
                            text: "Low",
                            position: "OUTSIDE",
                            color: "#ffffff",
                            fontSize: 10
                        },
                        {
                            text: "Fair",
                            position: "OUTSIDE",
                            color: "#ffffff",
                            fontSize: 10
                        },
                        {
                            text: "Good",
                            position: "OUTSIDE",
                            color: "#ffffff",
                            fontSize: 10
                        },
                        {
                            text: "Excellent",
                            position: "OUTSIDE",
                            color: "#ffffff",
                            fontSize: 10
                        }
                    ]}
                />
            </div>
        </>
    );
}

export default ScoreMeter;
