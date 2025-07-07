exports.handler = async function(event, context) {
    console.log("Evento recebido pela função hello:", event);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Olá do AnalfaBet via Netlify Function!" })
    };
};
