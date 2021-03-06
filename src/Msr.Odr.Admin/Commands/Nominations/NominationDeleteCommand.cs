// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Linq;
using System.Threading.Tasks;
using McMaster.Extensions.CommandLineUtils;
using Msr.Odr.Admin.Commands.Options;

namespace Msr.Odr.Admin.Commands.Nominations
{
	public class NominationDeleteCommand
    {
		public static void Configure(CommandLineApplication command)
		{
			command.Description = "Deletes a specific dataset nomination";
			command.SetDefaultHelp();

		    command.Option("--nominationId | -nmid <nominationId>", "The dataset nomination identifier", CommandOptionType.SingleValue);

            command.OnExecute(async () =>
			{
                var search = new SearchOptions();
                var cosmos = new CosmosOptions();
			    var nominationId = command.Options.FirstOrDefault(t => t.ValueName == "nominationId")?.Value();

                if (command.HasAllRequiredParameters(new[]
                {
                    search.Name,
                    cosmos.Endpoint,
                    cosmos.Database,
                    nominationId,
                }))
                {
                    await new Admin.Nomination.NominationDeleteTask(search, cosmos, nominationId).ExecuteAsync();
                }

                return 0;
			});
		}
	}
}
