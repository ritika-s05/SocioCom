const mailchimp = require('@mailchimp/mailchimp_marketing');

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER,
});

const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

// Test the connection
const pingMailchimp = async () => {
  const response = await mailchimp.ping.get();
  return response;
};

// Create a campaign when a high-engagement post has low sales
const triggerCampaign = async ({ postCaption, productName, engagementRate }) => {
  // Step 1 — Create the campaign
  const campaign = await mailchimp.campaigns.create({
    type: 'regular',
    recipients: { list_id: AUDIENCE_ID },
    settings: {
      subject_line: `🔥 ${productName} is trending — don't miss out!`,
      preview_text: `This post got ${engagementRate.toFixed(1)}% engagement. Shop now.`,
      title: `SocioCom Auto Campaign - ${productName}`,
      from_name: 'SocioCom',
      reply_to: process.env.MAILCHIMP_FROM_EMAIL || 'hello@sociocom.com',
    },
  });

  return {
    campaign_id: campaign.id,
    status: campaign.status,
    subject: campaign.settings.subject_line,
  };
};

module.exports = { pingMailchimp, triggerCampaign };