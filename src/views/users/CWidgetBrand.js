import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

//component - CoreUI / CWidgetBrand

const CWidgetBrand = props => {

    const {
        shift,
        className,
        //
        color,
        cardName,
        rightFooter,
        leftHeader,
        leftFooter,
        addHeaderClasses,
        bodySlot,
        ...attributes
    } = props

    // render

    const headerClasses = classNames(
        'card-header content-center text-white p-0',
        // color && `bg-${color}`,
        addHeaderClasses
    )

    return (
        <div className={`card ${className}`} {...attributes}>
            <div className={headerClasses} style={{  height: '50px', backgroundColor: color }}>
                {'Shift : ' + shift}
            </div>
            { bodySlot ||
                <div className="card-body row text-center">
                    <div className="col">
                        {
                            cardName && <div className="text-value-lg">{cardName}</div>
                        }
                        {
                            rightFooter &&
                            <div className="text-uppercase text-muted small">
                                {rightFooter}
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    )
}

CWidgetBrand.propTypes = {
    children: PropTypes.node,
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    //
    innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    color: PropTypes.string,
    rightHeader: PropTypes.string,
    rightFooter: PropTypes.string,
    leftHeader: PropTypes.string,
    leftFooter: PropTypes.string,
    addHeaderClasses: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    bodySlot: PropTypes.node
};

export default CWidgetBrand
