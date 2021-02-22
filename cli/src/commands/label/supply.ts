import { flags } from "@oclif/command";
import { EthCommand } from "../../base";

export class LabelSupply extends EthCommand {
  static flags = {
    ...EthCommand.flags,
    label: flags.string({
      description: "The label to query (numerical ID)",
      required: true,
    }),
  };

  async run() {
    const label = Number(this.flag.label);
    const labelExists = await this.token()
      .methods._labelExistence(label)
      .call();
    const labelSupply = this.uint256ToDecimals(
      await this.token().methods._labelSupply(label).call()
    );
    this.log(`Label: ${label}
Exists: ${labelExists}
Supply: ${labelSupply}`);
  }
}
