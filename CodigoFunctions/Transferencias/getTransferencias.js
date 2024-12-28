exports = async function(payload) {
  try {
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");

    const pipeline = [
  {
    $match: {
      Transferencias: {
        $exists: true
      }
    }
  },
  {
    $unwind: {
      path: "$Transferencias",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      _id: 0,
      ID_Paciente: 1,
      Data_Transferencia:
        "$Transferencias.Data_Transferencia",
      Motivo: "$Transferencias.Motivo",
      Tipo_Transferencia:
        "$Transferencias.Tipo_Transferencia",
      RegistoClinicos: {
        $cond: {
          if: {
            cond: {
              $lt: [
                "$RegistoClinicos.Data_Transferencia",
                "$Transferencias.Data_Transferencia"
              ]
            }
          },
          then: "$RegistoClinicos",
          else: "$$REMOVE"
        }
      }
    }
  }
];

    return await collection.aggregate(pipeline).toArray();
  } catch (error) {
    return {
      status: 500,
      message: "Erro ao pesquisar pelos dados da transferência.",
      details: error.message
    };
  }
};
