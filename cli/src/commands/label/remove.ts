import { flags } from "@oclif/command";
import { EthSigningCommand } from "../../base";

export class LabelRemove extends EthSigningCommand {
  static flags = {
    ...EthSigningCommand.flags,
    label: flags.string({
      description: "The label to remove from whitelist (numerical ID)",
      required: true,
    }),
  };

  async run() {
    const label = Number(this.flag.label);
    await this.signAndSend(
      this.issuer(),
      this.issuer().methods.removeLabel(label)
    );
    this.log(`Removed label: ${label}`);
  }
}
