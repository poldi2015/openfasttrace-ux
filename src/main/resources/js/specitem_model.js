(function (window, undefined) {
    window.specitem = {
        specitems: [
            {
                index: 0,
                name: 'req~req-global-first~1',
                content: 'This is the requirement text.' +
                    'with other stuff in a new line',
                covered: [2,3,4,5],
                needs: [2,3,4,5,6],
                status: 1,
                path: ['root','home','poldi']

            },
            {
                index: 1,
                name: 'arch~req-global-first~1',
                content: 'This is the requirement text.' +
                    'with other stuff in a new line',
                covered: [3],
                needs: [3,4,5,6],
                status: 0,
                path: ['root','home','poldi']

            }
        ]
    }
})(window);