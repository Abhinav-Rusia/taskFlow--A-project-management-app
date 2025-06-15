import Joi from 'joi';

// Generic validation middleware
export const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }))
            });
        }
        next();
    };
};

// User Registration Validation
export const registerValidation = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.alphanum': 'Username must contain only letters and numbers',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username cannot exceed 30 characters',
            'any.required': 'Username is required'
        }),
    
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .min(6)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        })
});

// OTP Verification Validation
export const otpValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers',
            'any.required': 'OTP is required'
        })
});

// User Login Validation
export const loginValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

// Project Validation
export const projectValidation = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'Project title must be at least 3 characters long',
            'string.max': 'Project title cannot exceed 100 characters',
            'any.required': 'Project title is required'
        }),
    
    description: Joi.string()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),
    
    status: Joi.string()
        .valid('pending', 'in-progress', 'completed')
        .default('pending')
        .messages({
            'any.only': 'Status must be one of: pending, in-progress, completed'
        }),
    
    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium')
        .messages({
            'any.only': 'Priority must be one of: low, medium, high'
        }),
    
    startDate: Joi.date()
        .optional()
        .messages({
            'date.base': 'Start date must be a valid date'
        }),
    
    dueDate: Joi.date()
        .min(Joi.ref('startDate'))
        .optional()
        .messages({
            'date.base': 'Due date must be a valid date',
            'date.min': 'Due date must be after start date'
        }),
    
    teamMembers: Joi.array()
        .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
        .optional()
        .messages({
            'string.pattern.base': 'Invalid team member ID format'
        })
});

// Task Validation
export const taskValidation = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'Task title must be at least 3 characters long',
            'string.max': 'Task title cannot exceed 100 characters',
            'any.required': 'Task title is required'
        }),
    
    description: Joi.string()
        .max(1000)
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 1000 characters'
        }),
    
    project: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid project ID format',
            'any.required': 'Project ID is required'
        }),
    
    assignedTo: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid user ID format'
        }),
    
    status: Joi.string()
        .valid('todo', 'in-progress', 'completed')
        .default('todo')
        .messages({
            'any.only': 'Status must be one of: todo, in-progress, completed'
        }),
    
    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium')
        .messages({
            'any.only': 'Priority must be one of: low, medium, high'
        }),
    
    dueDate: Joi.date()
        .min('now')
        .optional()
        .messages({
            'date.base': 'Due date must be a valid date',
            'date.min': 'Due date cannot be in the past'
        })
});

// Update validations (allow partial updates)
export const projectUpdateValidation = projectValidation.fork(
    ['title'], 
    (schema) => schema.optional()
);

export const taskUpdateValidation = taskValidation.fork(
    ['title', 'project'], 
    (schema) => schema.optional()
);
