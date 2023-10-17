const pemesananModel = require(`../models/index`).pemesanan;
const detailsOfPemesananModel = require(`../models/index`).detail_pemesanan;
const userModel = require(`../models/index`).user;
const customerModel = require(`../models/index`).customer;
const KamarModel = require(`../models/index`).kamar;
const tipeKamarModel = require(`../models/index`).tipe_kamar;

const Op = require(`sequelize`).Op;
// const date = require(`date-and-time`); 
const Sequelize = require("sequelize");
const moment = require(`moment`);
const randomstring = require(`randomstring`);
const sequelize = new Sequelize("wikuhotel", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

//tambah data
// exports.addPemesanan = async (request, response) => {
//   let nomor_kamar = request.body.nomor_kamar;
//   let room = await KamarModel.findOne({
//     where: {
//       [Op.and]: [{ nomor_kamar: { [Op.substring]: nomor_kamar } }],
//     },
//     attributes: ["id", "nomor_kamar", "tipeKamarId", "createdAt", "updatedAt"],
//     include: [
//       {
//         model: tipeKamarModel,
//         attributes: ["harga"],
//       },
//     ],
//   });

//   let nama_user = request.body.nama_user;
//   let userId = await userModel.findOne({
//     where: {
//       [Op.and]: [{ nama_user: { [Op.substring]: nama_user } }],
//     },
//   });

//   if (room === null) {
//     return response.json({
//       success: false,
//       message: `Kamar yang anda inputkan tidak ada`,
//     });
//   } else if (userId === null) {
//     return response.json({
//       success: false,
//       message: `User yang anda inputkan tidak ada`,
//     });
//   } else {
//     let newData = {
//       nomor_pemesanan: request.body.nomor_pemesanan,
//       nama_pemesan: request.body.nama_pemesan,
//       email_pemesan: request.body.email_pemesan,
//       tgl_pemesanan: Date.now(),
//       tgl_check_in: request.body.check_in,
//       tgl_check_out: request.body.check_out,
//       nama_tamu: request.body.nama_tamu,
//       jumlah_kamar: 1, // Hanya satu jumlah kamar yang diizinkan
//       tipeKamarId: room.tipeKamarId,
//       status_pemesanan: request.body.status,
//       userId: userId.id,
//     };
//     console.log(newData);
//     let roomCheck = await sequelize.query(
//       `SELECT * FROM detail_pemesanans WHERE kamarId = ${room.id} AND tgl_akses >= "${request.body.check_in}" AND tgl_akses <= "${request.body.check_out}" ;`
//     );

//     if (roomCheck[0].length === 0) {
//       const tglCheckIn = new Date(request.body.check_in);
//       const tglCheckOut = new Date(request.body.check_out);
//       const diffTime = Math.abs(tglCheckOut - tglCheckIn);
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       pemesananModel
//         .create(newData)
//         .then((result) => {
//           let pemesananID = result.id;
//           // let detailsOfPemesanan = request.body.details_of_pemesanan;
//           let detailData = [];

//           for (let i = 0; i <= diffDays; i++) {
//             let newDetail = {
//               pemesananId: pemesananID,
//               kamarId: room.id,
//               tgl_akses: new Date(
//                 tglCheckIn.getTime() + i * 24 * 60 * 60 * 1000
//               ),
//               harga: room.tipe_kamar.harga,
//             };
//             detailData.push(newDetail);
//           }

//           detailsOfPemesananModel
//             .bulkCreate(detailData)
//             .then((result) => {
//               return response.json({
//                 success: true,
//                 message: `New transaction has been inserted`,
//               });
//             })
//             .catch((error) => {
//               return response.json({
//                 success: false,
//                 message: error.message,
//               });
//             });
//         })
//         .catch((error) => {
//           return response.json({
//             success: false,
//             message: error.message,
//           });
//         });
//     } else {
//       return response.json({
//         success: false,
//         message: `Kamar yang anda pesan sudah di booking`,
//       });
//     }
//   }
// };

exports.addPemesanan = async (request, response) => {
  let nama_user = request.body.nama_user;
  let userId = await customerModel.findOne({
    where: {
      [Op.and]: [{ nama: nama_user }],
    },
  });
  if (userId === null) {
    return response.status(400).json({
      success: false,
      message: "User yang anda inputkan tidak ada",
    });
  } else {
    //tanggal pemesanan sesuai tanggal hari ini + random string
    let date = moment();
    let tgl_pemesanan = date.format("YYYY-MM-DD");

    // Generate a random string (7 characters in this case)
    const random = randomstring.generate(7);

    // Combine timestamp and random string to create nomorPem
    let nomorPem = `${Date.now()}_${random}`;

    let tgl_check_in = request.body.tgl_check_in;
    let tgl_check_out = request.body.tgl_check_out;
    const date1 = moment(tgl_check_in);
    const date2 = moment(tgl_check_out);

    if (date2.isBefore(date1)) {
      return response.status(400).json({
        success: false,
        message: "masukkan tanggal yang benar",
      });
    }
    let tipe_kamar = request.body.tipe_kamar;

    let tipeRoomCheck = await tipeKamarModel.findOne({
      where: {
        [Op.and]: [{ nama_tipe_kamar: tipe_kamar }],
      },
      attributes: [
        "id",
        "nama_tipe_kamar",
        "harga",
        "deskripsi",
        "foto",
        "createdAt",
        "updatedAt",
      ],
    });
    console.log(tipeRoomCheck);
    if (tipeRoomCheck === null) {
      return response.status(400).json({
        success: false,
        message: "Tidak ada tipe kamar dengan nama itu",
      });
    }
    //mendapatkan kamar yang available di antara tanggal check in dan check out sesuai dengan tipe yang diinput user
    const result = await sequelize.query(
      `SELECT tipe_kamars.nama_tipe_kamar, kamars.nomor_kamar FROM kamars LEFT JOIN tipe_kamars ON kamars.tipeKamarId = tipe_kamars.id LEFT JOIN detail_pemesanans ON detail_pemesanans.kamarId = kamars.id WHERE kamars.id NOT IN (SELECT kamarId from detail_pemesanans WHERE tgl_akses BETWEEN '${tgl_check_in}' AND '${tgl_check_out}') AND tipe_kamars.nama_tipe_kamar ='${tipe_kamar}' GROUP BY kamars.nomor_kamar`
    );
    //cek apakah ada
    if (result[0].length === 0) {
      return response.status(400).json({
        success: false,
        message: "Kamar dengan tipe itu dan di tanggal itu sudah terbooking",
      });
    }

    //masukkan nomor kamar ke dalam array
    const array = [];
    for (let index = 0; index < result[0].length; index++) {
      array.push(result[0][index].nomor_kamar);
    }

    //validasi agar input jumlah kamar tidak lebih dari kamar yang tersedia
    if (result[0].length < request.body.jumlah_kamar) {
      return response.status(400).json({
        success: false,
        message: `hanya ada ${result[0].length} kamar tersedia`,
      });
    }

    //mencari random index dengan jumlah sesuai input jumlah kamar
    let randomIndex = [];
    for (let index = 0; index < request.body.jumlah_kamar; index++) {
      randomIndex.push(Math.floor(Math.random() * array.length));
    }

    //isi data random elemnt dengan isi dari array dengan index random dari random index
    let randomElement = [];
    for (let index = 0; index < randomIndex.length; index++) {
      randomElement.push(Number(array[index]));
    }

    console.log("random index", randomIndex);
    console.log("random", randomElement);

    //isi roomId dengan data kamar hasil randoman
    let roomId = [];
    for (let index = 0; index < randomElement.length; index++) {
      roomId.push(
        await KamarModel.findOne({
          where: {
            [Op.and]: [{ nomor_kamar: randomElement[index] }],
          },
          attributes: [
            "id",
            "nomor_kamar",
            "tipeKamarId",
            "createdAt",
            "updatedAt",
          ],
        })
      );
    }

    console.log("roomid", roomId);

    //dapatkan harga dari id_tipe_kamar dikali dengan inputan jumlah kamar
    let roomPrice = 0;
    let cariTipe = await tipeKamarModel.findOne({
      where: {
        [Op.and]: [{ id: roomId[0].tipeKamarId }],
      },
      attributes: [
        "id",
        "nama_tipe_kamar",
        "harga",
        "deskripsi",
        "foto",
        "createdAt",
        "updatedAt",
      ],
    });
    roomPrice = cariTipe.harga * request.body.jumlah_kamar;

    let newData = {
      nomor_pemesanan: request.body.nomor_pemesanan,
      nama_pemesan: request.body.nama_pemesan,
      email_pemesan: request.body.email_pemesan,
      tgl_pemesanan: tgl_pemesanan,
      tgl_check_in: request.body.tgl_check_in,
      tgl_check_out: request.body.tgl_check_out,
      nama_tamu: request.body.nama_tamu,
      jumlah_kamar: request.body.jumlah_kamar,
      tipeKamarId: cariTipe.id,
      status_pemesanan: "baru",
      userId: userId.id,
    };

    //menetukan harga dengan cara mengali selisih tanggal check in dan check out dengan harga tipe kamar
    const startDate = moment(newData.tgl_check_in);
    const endDate = moment(newData.tgl_check_out);
    const duration = moment.duration(endDate.diff(startDate));
    const nights = duration.asDays();
    const harga = nights * roomPrice;

    //cek jika ada inputan kosong
    for (const [key, value] of Object.entries(newData)) {
      if (!value || value === "") {
        console.log(`Error: ${key} is empty`);
        return response
          .status(400)
          .json({ error: `${key} kosong mohon di isi` });
      }
    }

    pemesananModel
  .create(newData)
  .then((result) => {
    let pemesananID = result.id;

    let tgl1 = new Date(result.tgl_check_in);
    let tgl2 = new Date(result.tgl_check_out);
    let checkIn = moment(tgl1).format("YYYY-MM-DD");
    let checkOut = moment(tgl2).format("YYYY-MM-DD");

    // check if the dates are valid
    let success = true;
    let message = "";

    // Create an array to store promises for detail creation
    let createDetailPromises = [];

    // Loop through dates and rooms to create details
    for (
      let m = moment(checkIn, "YYYY-MM-DD");
      m.isBefore(checkOut);
      m.add(1, "days")
    ) {
      let date = m.format("YYYY-MM-DD");

      // isi newDetail dengan id kamar hasil randomana lalu insert dengan di loop sesuai array yang berisi randoman kamar
      let newDetail = [];
      for (let index = 0; index < roomId.length; index++) {
        newDetail.push({
          pemesananId: pemesananID,
          kamarId: roomId[index].id,
          tgl_akses: date,
          harga: harga,
        });
      }

      // Create a promise for each detail creation and push it to the array
      createDetailPromises.push(
        Promise.all(
          newDetail.map((detail) =>
            detailsOfPemesananModel.create(detail)
          )
        )
      );
    }

    // Wait for all detail creation promises to resolve
    Promise.all(createDetailPromises)
      .then(() => {
        // All details have been created successfully
        // You can now send the response
        return response.json({
          success: true,
          message: "New transactions have been inserted",
        });
      })
      .catch((error) => {
        return response.json({
          success: false,
          message: error.message,
        });
      });
  })
  .catch((error) => {
    return response.json({
      success: false,
      message: error.message,
    });
  });

  }
};

//get by user
exports.getByUser = async (request, response) => {
  let email = request.params.email;

  const result = await pemesananModel.findAll({
    include: {
      model: tipeKamarModel,
      attributes: ["nama_tipe_kamar", "harga"]
    },
    where: {
      email_pemesan : email
    },
    order: [['createdAt', 'DESC']],
  });
  if (result.length === 0) {
    return response.json({
      success: true,
      data: [],
      message: "Data tidak ditemukan",
    })
  }

 return response.json({
    success: true,
    data: result,
    message: `All Transaction have been loaded...`,
  });
};

//update data
// exports.updatePemesanan = async (request, response) => {
//   let nomor_kamar = request.body.nomor_kamar;
//   let kamar = await KamarModel.findOne({
//     where: {
//       [Op.and]: [{ nomor_kamar: { [Op.substring]: nomor_kamar } }],
//     },
//     attributes: ["id", "nomor_kamar", "tipeKamarId", "createdAt", "updatedAt"],
//   });

//   let nama_user = request.body.nama_user;
//   let userId = await userModel.findOne({
//     where: {
//       [Op.and]: [{ nama_user: { [Op.substring]: nama_user } }],
//     },
//   });

//   let newData = {
//     nomor_pemesanan: request.body.nomor_pemesanan,
//     nama_pemesan: request.body.nama_pemesan,
//     email_pemesan: request.body.email_pemesan,
//     tgl_pemesanan: request.body.tgl_pemesanan,
//     tgl_check_in: request.body.check_in,
//     tgl_check_out: request.body.check_out,
//     nama_tamu: request.body.nama_tamu,
//     jumlah_kamar: 1, // Hanya satu jumlah kamar yang diizinkan
//     tipeKamarId: room.tipeKamarId,
//     status_pemesanan: request.body.status,
//     userId: userId.id,
//   };

//   let pemesananId = request.params.id;

//   try {
//     const existingPemesanan = await pemesananModel.findByPk(pemesananId);

//     if (!existingPemesanan) {
//       return response.json({
//         success: false,
//         message: `Pemesanan dengan ID ${pemesananId} tidak ditemukan`,
//       });
//     }

//     await existingPemesanan.update(newData);

//     return response.json({
//       success: true,
//       message: `Pemesanan dengan ID ${pemesananId} berhasil diperbarui`,
//     });
//   } catch (error) {
//     return response.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


//delete data
// exports.deletePemesanan = async (request, response) => {
//   let pemesananID = request.params.id;

//   detailsOfPemesananModel
//     .destroy({
//       where: { pemesananId: pemesananID },
//     })
//     .then((result) => {
//       pemesananModel
//         .destroy({ where: { id: pemesananID } })
//         .then((result) => {
//           return response.json({
//             success: true,
//             message: `Transaction has been deleted`,
//           });
//         })
//         .catch((error) => {
//           return response.json({
//             success: false,
//             message: error.message,
//           });
//         });
//     })
//     .catch((error) => {
//       return response.json({
//         success: false,
//         message: error.message,
//       });
//     });
// };

//mendapatkan semua data
exports.getAllPemesanan = async (request, response) => {
  const result = await pemesananModel.findAll({
    include: {
      model: tipeKamarModel,
      attributes: ['nama_tipe_kamar']
    },
    order:[['createdAt', 'DESC']],
  });
  if (result.length === 0) {
    return response.json({
      success: true,
      data: [],
      message: "Data tidak ditemukan",
    })
  }

  response.json({
    success: true,
    data: result,
    message: `All Transaction have been loaded...`,
  });
};


//mendapatkan salah satu data
// exports.find = async (request, response) => {
//   let keyword = request.body.keyword;
  
//   const result = await pemesananModel.findAll({
//     where: {
//       [Op.and]: [{ nama_pemesan: {[Op.substring]: keyword} }], 
//     },
//     include: {
//       model: tipeKamarModel,
//       attributes: ['nama_tipe_kamar']
//     },
//     order: [['createdAt', 'DESC']]
//   });

//   return response.json({
//     success: true,
//     data: result,
//     message: `Transaction have been loaded`,
//   });
// };

exports.findPemesanan = async (request, response) => {
  try {
    let keyword = request.body.keyword;

    let pemesanans = await pemesananModel.findAll({
      where: {
        [Op.or]: [
          { nama_tamu: { [Op.substring]: keyword } },
          { nomor_pemesanan: { [Op.substring]: keyword } },
        ],
       
      },
      include: {
        model: tipeKamarModel ,
        attributes: ['nama_tipe_kamar'],
      },
    });
    
    if (pemesanans.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }
    
    return response.json({
      success: true,
      data: pemesanans,
      message: "All rooms have been loaded",
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

exports.findNumber = async (request, response) => {
  try {
    let keyword = request.body.keyword;

    let pemesanans = await pemesananModel.findAll({
      where: {
        [Op.or]: [
          { nomor_pemesanan: { [Op.substring]: keyword } },
        ],
       
      },
      include: {
        model: tipeKamarModel,
        attributes: ['nama_tipe_kamar'],
      },
    });
    
    if (pemesanans.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }
    
    return response.json({
      success: true,
      data: pemesanans,
      message: "All rooms have been loaded",
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// exports.findPemesananCheck = async (request, response) => {
//   try {
//     let tgl_check_in = new Date(request.body.tgl_check_in);

//     let pemesanans = await pemesananModel.findAll({
//       where: {
//          tgl_check_in:  tgl_check_in ,
       
//       },
//       include: {
//         model: tipeKamarModel,
//         attributes: ['nama_tipe_kamar'],
//       },
//     });
    
//     if (pemesanans.length === 0) {
//       return response.status(404).json({
//         success: false,
//         message: "Data tidak ditemukan",
//       });
//     }
    
//     return response.json({
//       success: true,
//       data: pemesanans,
//       message: "All rooms have been loaded",
//     });
//   } catch (error) {
//     console.error(error);
//     return response.status(500).json({
//       success: false,
//       message: "Terjadi kesalahan server",
//     });
//   }
// };

exports.findPemesananCheck = async (request, response) => {
  try {
    let tgl_check_in = new Date(request.body.tgl_check_in);

    let pemesanans = await pemesananModel.findAll({
      where: {
         tgl_check_in:  tgl_check_in,
      },
      include: {
        model: tipeKamarModel,
        attributes: ['nama_tipe_kamar'],
      },
    });
    
    if (pemesanans.length === 0) {
      // Jika tidak ada hasil ditemukan, kirim respons 404 tanpa data
      return response.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }
    
    // Jika ada hasil ditemukan, kirim data ke frontend
    return response.json({
      success: true,
      data: pemesanans,
      message: "All rooms have been loaded",
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};


//update pemesanan
  exports.updateStatusBooking = async (req, res) => {
    try {
      const params = { id: req.params.id };

      const result = await pemesananModel.findOne({ where: params });
      if (!result) {
        return res.status(404).json({
          message: "Data not found!",
        });
      }

      const data = {
        status_pemesanan: req.body.status_pemesanan,
      };

      if (data.status_pemesanan === "check_out") {
        await pemesananModel.update(data, { where: params });

        const updateTglAccess = {
          tgl_akses: null,
        };
        await detailsOfPemesananModel.update(updateTglAccess, { where: params });
        return res.status(200).json({
          message: "Success update status booking to check out",
          code: 200,
        });
      }

      await pemesananModel.update(data, { where: params });
      return res.status(200).json({
        message: "Success update status booking",
        code: 200,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal error",
        err: err,
      });
    }
  };
