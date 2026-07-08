const { pingMailchimp, triggerCampaign } = require('../services/mailchimpService');

const ping = async (req, res, next) => {
  try {
    const response = await pingMailchimp();
    res.status(200).json({
      status: 'ok',
      message: 'Mailchimp connected',
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const { postCaption, productName, engagementRate } = req.body;

    if (!postCaption || !productName || !engagementRate) {
      return res.status(400).json({
        status: 'error',
        message: 'postCaption, productName and engagementRate are required',
      });
    }

    const campaign = await triggerCampaign({ postCaption, productName, engagementRate });

    res.status(200).json({
      status: 'ok',
      message: 'Campaign created successfully',
      data: campaign,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { ping, createCampaign };