const Joi=require('joi');
const {number}=require('joi');

module.exports.trekSchema=Joi.object({
    trek:Joi.object({
        title:Joi.string().required(),
        price:Joi.number().required().min(0),
        // image:Joi.string().required(),
        organization:Joi.string().required(),
        start_date:Joi.string().required(),
        end_date:Joi.string().required(),
        location:Joi.string().required(),
        description:Joi.string().required(),
    }).required(),
    deleteImages:Joi.array()
})

module.exports.enrollSchema=Joi.object({
    enroll:Joi.object({
         full_name:Joi.string().required(),
         dob:Joi.date().required(),
         user_email:Joi.string().required(),
         city:Joi.string().required(),
         isTrekked:Joi.string().required(),
    }).required()
})

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        body:Joi.string().required()
    }).required()
})
