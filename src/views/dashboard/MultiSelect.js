import React from 'react';
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css"
export default function MultiSelectSort() {
    const [state, setState] = React.useState({
        value: {
            min: 0,
            max: 2,
        },
        value2: {
            min: 3,
            max: 5,
        },
        value3: {
            min: 6,
            max: 8,
        },
        value4: {
            min: 9,
            max: 11,
        },
        value5: {
            min: 12,
            max: 20,
        },
    });

    return (
        <form className="form">
            <label>Blau :</label>
            <br />
            <br />
            <InputRange
                maxValue={20}
                minValue={0}
                value={state.value}
                onChange={value => setState({ ...state, value: value })}
                onChangeComplete={value => console.log(value)} />
            <br />

            <label>Verd :</label>
            <br />
            <br />
            <InputRange
                maxValue={20}
                minValue={0}
                value={state.value2}
                onChange={value => setState({ ...state, value2: value })}
                onChangeComplete={value => console.log(value)} />
            <br />

            <label>Taronja :</label>
            <br />
            <br />
            <InputRange
                maxValue={20}
                minValue={0}
                // formatLabel={value => value.toFixed(2)}
                value={state.value3}
                onChange={value => setState({ ...state, value3: value })}
                onChangeComplete={value => console.log(value)} />
            <br />

            <label>Vermell :</label>
            <br />
            <br />
            <InputRange
                maxValue={20}
                minValue={0}
                // formatLabel={value => `${value} kg`}
                value={state.value4}
                onChange={value => setState({ ...state, value4: value })}
                onChangeComplete={value => console.log(value)} />
            <br />


            <label>Negre :</label>
            <br />
            <br />
            <InputRange
                draggableTrack
                maxValue={20}
                minValue={0}
                onChange={value => setState({ ...state, value5: value })}
                onChangeComplete={value => console.log(value)}
                value={state.value5} />
        </form>
    );
}