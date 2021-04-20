import React from 'react';

import Select, { components } from 'react-select';
import {
    SortableContainer,
    SortableElement,
    sortableHandle,
} from 'react-sortable-hoc';
// import { colourOptions } from './docs/data';

function arrayMove(array, from, to) {
    array = array.slice();
    array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
    return array;
}

const SortableMultiValue = SortableElement(props => {
    // this prevents the menu from being opened/closed when the user clicks
    // on a value to begin dragging it. ideally, detecting a click (instead of
    // a drag) would still focus the control and toggle the menu, but that
    // requires some magic with refs that are out of scope for this example
    const onMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
    };
    const innerProps = { ...props.innerProps, onMouseDown };
    return <components.MultiValue {...props} innerProps={innerProps} />;
});

const SortableMultiValueLabel = sortableHandle(props => (
    <components.MultiValueLabel {...props} />
));

const SortableSelect = SortableContainer(Select);

export default function MultiSelectSort() {
    const [selected, setSelected] = React.useState([
        // colourOptions[4],
        // colourOptions[5],
    ]);

    const onChange = selectedOptions => setSelected(selectedOptions);

    const onSortEnd = ({ oldIndex, newIndex }) => {
        const newValue = arrayMove(selected, oldIndex, newIndex);
        setSelected(newValue);
        console.log(
            'Values sorted:',
            newValue.map(i => i.value)
        );
    };

    return (
        <SortableSelect
            useDragHandle
            // react-sortable-hoc props:
            axis="xy"
            onSortEnd={onSortEnd}
            distance={4}
            // small fix for https://github.com/clauderic/react-sortable-hoc/pull/352:
            getHelperDimensions={({ node }) => node.getBoundingClientRect()}
            // react-select props:
            hideSelectedOptions={false}
            isMulti
            options={[{ value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
            { value: 'blue', label: 'Blue', color: '#0052CC'},
            { value: 'purple', label: 'Purple', color: '#5243AA' },
            { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
            { value: 'orange', label: 'Orange', color: '#FF8B00' },
            { value: 'yellow', label: 'Yellow', color: '#FFC400' },
            { value: 'green', label: 'Green', color: '#36B37E' },
            { value: 'forest', label: 'Forest', color: '#00875A' },
            { value: 'slate', label: 'Slate', color: '#253858' },
            { value: 'silver', label: 'Silver', color: '#666666' }]}
            value={selected}
            onChange={onChange}
            components={{
                MultiValue: SortableMultiValue,
                MultiValueLabel: SortableMultiValueLabel,
            }}
            closeMenuOnSelect={false}
        />
    );
}