exports = async function(payload) {
  try {
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Transferencias");

    const pipeline = [
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