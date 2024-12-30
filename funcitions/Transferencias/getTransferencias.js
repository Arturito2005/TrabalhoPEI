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

    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");

    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          Transferencias: { $exists: true }
        }
      },
      {
        $unwind: {
          path: "$Transferencias",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "Transferencias.Data_Transferencia": {
            $gte: dataInicio,
            $lte: dataFim
          }
        }
      },
      {
        $project: {
          _id: 0,
          ID_Paciente: 1,
          Data_Transferencia: "$Transferencias.Data_Transferencia",
          Motivo: "$Transferencias.Motivo",
          Tipo_Transferencia: "$Transferencias.Tipo_Transferencia",
          RelatorioMedico: {
            $map: {
              input: {
                $filter: {
                  input: { $ifNull: ["$RegistoClinicos", []] },
                  as: "registro",
                  cond: {
                    $lt: ["$$registro.Data_Atendimento", "$Transferencias.Data_Transferencia"]
                  }
                }
              },
              as: "registro",
              in: {
                ID_Atendimento: "$$registro.ID_Atendimento",
                ID_Profissional: "$$registro.ID_Profissional",
                Data_Atendimento: "$$registro.Data_Atendimento",
                Diagnosticos: "$$registro.Diagnosticos",
                Especialidade: "$$registro.Especialidade",
                Tratamentos: {
                  $cond: {
                    if: { $gt: [{ $size: { $ifNull: ["$$registro.Tratamentos", []] } }, 0] },
                    then: {
                      $filter: {
                        input: "$$registro.Tratamentos",
                        as: "tratamento",
                        cond: { $eq: ["$$tratamento.Realizado", "Sim"] }
                      }
                    },
                    else: "$$REMOVE"
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          ID_Paciente: 1,
          Data_Transferencia: 1,
          Motivo: 1,
          Tipo_Transferencia: 1,
          RelatorioMedico: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$RelatorioMedico", []] } }, 0] },
              then: {
                $map: {
                  input: "$RelatorioMedico",
                  as: "registro",
                  in: {
                    ID_Atendimento: "$$registro.ID_Atendimento",
                    ID_Profissional: "$$registro.ID_Profissional",
                    Data_Atendimento: "$$registro.Data_Atendimento",
                    Diagnosticos: "$$registro.Diagnosticos",
                    Especialidade: "$$registro.Especialidade",
                    Tratamentos: {
                      $cond: {
                        if: { $gt: [{ $size: { $ifNull: ["$$registro.Tratamentos", []] } }, 0] },
                        then: "$$registro.Tratamentos",
                        else: "$$REMOVE"
                      }
                    }
                  }
                }
              },
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
