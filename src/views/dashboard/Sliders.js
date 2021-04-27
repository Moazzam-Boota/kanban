import React from 'react';
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css"
import { range_Select } from "../../redux/actions/actions";
import { useDispatch, useSelector } from 'react-redux'
export default function Sliders() {
    const [range, setRange] = React.useState({
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
            min: 11,
            max: 12,
        },
    });
    const dispatch = useDispatch();
    dispatch(range_Select(range));

    return (
        <form className="form">
            <label>Blau :</label>
            <br />
            <br />
            <InputRange
                maxValue={12}
                minValue={0}
                value={range.value}
                onChange={value => setRange({ ...range, value: value })} />
            <br />

            <label>Verd :</label>
            <br />
            <br />
            <InputRange
                maxValue={12}
                minValue={0}
                value={range.value2}
                onChange={value => setRange({ ...range, value2: value })} />
            <br />

            <label>Taronja :</label>
            <br />
            <br />
            <InputRange
                maxValue={12}
                minValue={0}
                // formatLabel={value => value.toFixed(2)}
                value={range.value3}
                onChange={value => setRange({ ...range, value3: value })} />
            <br />

            <label>Vermell :</label>
            <br />
            <br />
            <InputRange
                maxValue={12}
                minValue={0}
                // formatLabel={value => `${value} kg`}
                value={range.value4}
                onChange={value => setRange({ ...range, value4: value })} />
            <br />


            <label>Negre :</label>
            <br />
            <br />
            <InputRange
                draggableTrack
                maxValue={12}
                minValue={0}
                value={range.value5}
                onChange={value => setRange({ ...range, value5: value })} />
        </form>
    );
}