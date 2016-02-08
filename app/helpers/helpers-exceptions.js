var ExceptionTypes = {
    routeException: {
            type: 'routeNotFound',
            message: 'Nu exista o astfel de pagina pe acest site... Poate acasa la zergi!'
    },
    mongooseEntityNotFoundException: {
        type: 'entityNotFound',
        message: 'Ne pare rau, insa nu putem gasi ceea ce cauti tu. Incearca cu un observer!'
    }
};

module.exports = ExceptionTypes;
