import { flags } from "@oclif/command";
import { EthSigningCommand } from "../../base";

export class LabelAdd extends EthSigningCommand {
  static flags = {
    ...EthSigningCommand.flags,
    label: flags.string({
      description: "The label to whitelist (numerical ID)",
      required: true,
    }),
  };

  async run() {
    const label = Number(this.flag.label);
    await this.signAndSend(
      this.issuer(),
      this.issuer().methods.addLabel(label)
    );
    this.log(`Added label: ${label}`);
  }
}
