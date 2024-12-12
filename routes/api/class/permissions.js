const { classInformation } = require("../../../modules/class")
const { logger } = require("../../../modules/logger")

module.exports = {
	run(router) {
		// Gets the permissions of a class
		router.get('/class/:key/permissions', async (req, res) => {
			try {
				// Get the class key from the request parameters
				let key = req.params.key

				// Log the request details
				logger.log('info', `[get api/class/${key}/permissions] ip=(${req.ip}) session=(${JSON.stringify(req.session)})`)

				// Get a clone of the class data
				let classData = structuredClone(classInformation[key])
				// If the class does not exist, return an error
				if (!classData) {
					res.status(404).json({ error: 'Class not started' })
					return
				}

				// Get the user from the session
				let user = req.session.user

				// If the user is not in the class, return an error
				if (!classData.students[user.username]) {
					logger.log('verbose', `[get api/class/${key}/permissions] user is not logged in`)
					res.status(403).json({ error: 'User is not logged into the selected class' })
					return
				}

				// Log the class permissions
				logger.log('verbose', `[get api/class/${key}/permissions] response=(${JSON.stringify(classData.permissions)})`)
				
				// Send the class permissions as a JSON response
				res.status(200).json(classData.permissions)
			} catch (err) {
				// If an error occurs, log the error and send an error message as a JSON response
				logger.log('error', err.stack)
				res.status(500).json({ error: 'There was a server error try again.' })
			}
		})        
	}
}