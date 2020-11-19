from __future__ import absolute_import

from time import time

from rest_framework.test import APITestCase as BaseAPITestCase

from sentry.models.identity import Identity, IdentityProvider
from sentry.models.integration import Integration
from sentry.testutils import TestCase

from tests.fixtures.integrations.jira.mocks import MockJira


class TicketRulesTestCase(TestCase, BaseAPITestCase):
    def setUp(self):
        super(TicketRulesTestCase, self).setUp()

        self.mock_jira = MockJira()

        azure_devops_integration = Integration.objects.create(
            provider="vsts",
            external_id="vsts_external_id",
            name="fabrikam-fiber-inc",
            metadata={
                "domain_name": "https://fabrikam-fiber-inc.visualstudio.com/",
                "default_project": "0987654321",
            },
        )
        identity = Identity.objects.create(
            idp=IdentityProvider.objects.create(type="vsts", config={}),
            user=self.user,
            external_id="vsts",
            data={"access_token": "123456789", "expires": time() + 1234567},
        )
        azure_devops_integration.add_organization(self.organization, self.user, identity.id)

        jira_integration = Integration.objects.create(
            provider="jira",
            name="Jira Cloud",
            metadata={
                "oauth_client_id": "oauth-client-id",
                "shared_secret": "a-super-secret-key-from-atlassian",
                "base_url": "https://example.atlassian.net",
                "domain_name": "example.atlassian.net",
            },
        )
        jira_integration.add_organization(self.organization, self.user)

    def test_ticket_rules(self):
        print("test_ticket_rules")

        # simulate setting dynamic fields
        self.mock_jira.set_createmeta("project", {})

        # TODO MARCOS FIRST what is the API?
        self.mock_jira.break_client(400)

        # URL: http: // dev.getsentry.net:8000 / api / 0 / projects / sentry / internal / rules /

        # create the jira ticket rule
        # create the azure devops ticket rule
        # simulate new issue
        # assert tickets created in DB
        # assert ticket created on jira
        # assert ticket created on azure devops
        # simulate new issue
        # assert tickets not created in DB
        assert False
