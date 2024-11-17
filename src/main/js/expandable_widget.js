/**
*
* Widget on the left side that can be collapsed.
*
* The Widget itself needs to be a <div> with class "expandable-widget", The title of the widget
* is set by the attribute "data-type", a tooltip by the attribute "data-tooltip".
*/


//
// API

/**
 * Adds title and tooltip and the expand collapse functionality to expandable widgets.
 */
export function init() {
    $(".expandable-widget").each(function () {
        const title = $(this).data("title");
        $(this).wrapInner('<div class="_expandable-widget-content"></div>');
        $(this).prepend(`
            <div class="_expandable-widget-header collapsed">
                <span onclick="ExpandableWidget.toggleExpansion(this.parentNode)">${title}</span>
            </div>
        `);
        toggleExpansion($(this).children('._expandable-widget-header')[0]);
    });
}


//
// Event listeners

window.ExpandableWidget = {
    toggleExpansion : toggleExpansion
}

/**
 * onClick function that expands and collapses the widget content.
 *
 * The function is automatically added to the header.
 *
 * @param {*} header the header class element
 */
function toggleExpansion(header) {
    header.classList.toggle("collapsed");
    const content = header.nextElementSibling;
    content.classList.toggle("visible");
}


