exports = async function(request, response) {
  try {
    const mes = parseInt(request.query.mes, 10);
    const ano = parseInt(request.query.ano, 10);

    if (isNaN(mes) || isNaN(ano)) {
      return { error: "Os parâmetros 'mes' e 'ano' são obrigatórios e devem ser números válidos." };
    }

    if (mes < 1 || mes > 12) {
      return { error: "O parâmetro 'mes' deve estar entre 1 e 12." };
    }

    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Transferencias");

    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          Data_Transferencia: {
            $gte: dataInicio,
            $lte: dataFim
          }
        }
      },
      {
        $project: {
          _id: 0,
          hospitalDestino: "$Hospital_Destino"
        }
      },
      {
        $group: {
          _id: "$hospitalDestino" 
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();

    result.forEach((hospital, index) => {
      hospital.hospitalId = index + 1;
    });

    return result;
  } catch (error) {
    return {
      status: 500,
      message: "Erro ao pesquisar pelos hospitais que fizeram transferências",
      details: error.message
    };
  }
};
