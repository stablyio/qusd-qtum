import { flags } from "@oclif/command";
import { EthSigningCommand } from "../../../base";

export class IssuerMintPropose extends EthSigningCommand {
  static DEFAULT_LABEL = 0;

  static flags = {
    ...EthSigningCommand.flags,
    to: flags.string({
      description: "The address to issue new tokens to, defaults to self",
    }),
    amount: flags.string({
      description: "The amount of propose (e.g. 154.23)",
      required: true,
    }),
    label: flags.string({
      description: "The label to mint under (numerical ID)",
    }),
  };

  async run() {
    const recipient = this.flag.to
      ? this.flag.to
      : await this.getSignerAddress();
    const uint256Amount = this.decimalsToUint256(this.flag.amount);
    const label = this.flag.label
      ? this.flag.label
      : IssuerMintPropose.DEFAULT_LABEL;
    await this.signAndSend(
      this.issuer(),
      this.issuer().methods.proposeMintForLabel(recipient, uint256Amount, label)
    );
    this.log(`Proposed mint to ${recipient} for ${this.flag.amount}`);
  }
}
