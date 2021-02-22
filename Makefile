.PHONY: all token clean

all: token

token:
	$(MAKE) -C token all

clean:
	$(MAKE) -C token clean
