export const esFechaValida = (value) => {
    const fechaEntrada = new Date(value);
    const ahora = new Date();

    if (fechaEntrada > ahora) {
        throw new Error("La fecha no puede ser mayor a la actual");
    }
    
    return true;
};